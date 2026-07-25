import { describe, expect, it } from "vitest";

import {
  completedCapture,
  completedRefund,
  finalizePayPalOrder,
  revokeRefundedPayPalOrder,
} from "@/lib/server/paypal";

describe("completedCapture", () => {
  it("extracts the authoritative completed capture", () => {
    expect(
      completedCapture({
        id: "paypal-order",
        status: "COMPLETED",
        purchase_units: [
          {
            reference_id: "local-order",
            payments: {
              captures: [
                {
                  id: "capture-id",
                  status: "COMPLETED",
                  amount: { currency_code: "USD", value: "19.99" },
                },
              ],
            },
          },
        ],
      }),
    ).toEqual({
      captureId: "capture-id",
      currency: "USD",
      amount: "19.99",
      referenceId: "local-order",
    });
  });

  it("rejects incomplete orders", () => {
    expect(completedCapture({ id: "order", status: "APPROVED" })).toBeNull();
  });
});

describe("finalizePayPalOrder", () => {
  it("accepts an identical replay for an already completed order", async () => {
    const database = {
      prepare: () => ({
        bind() { return this; },
        first: async () => ({
          id: "local-order",
          user_id: "user-id",
          amount_usd: "19.99",
          currency: "USD",
          credits: 40,
          status: "completed",
          paypal_capture_id: "capture-id",
        }),
      }),
      batch: async () => { throw new Error("batch should not run"); },
    };

    await expect(finalizePayPalOrder({
      database: database as never,
      paypalOrderId: "paypal-order",
      payment: { captureId: "capture-id", currency: "USD", amount: "19.99" },
    })).resolves.toBe(true);
  });

  it("rejects a different capture for an already completed order", async () => {
    const database = {
      prepare: () => ({
        bind() { return this; },
        first: async () => ({
          id: "local-order",
          user_id: "user-id",
          amount_usd: "19.99",
          currency: "USD",
          credits: 40,
          status: "completed",
          paypal_capture_id: "original-capture",
        }),
      }),
      batch: async () => [],
    };

    await expect(finalizePayPalOrder({
      database: database as never,
      paypalOrderId: "paypal-order",
      payment: { captureId: "other-capture", currency: "USD", amount: "19.99" },
    })).rejects.toThrow("another capture");
  });
});

describe("completedRefund", () => {
  it("extracts the capture ID from the PayPal parent link", () => {
    expect(completedRefund({
      id: "refund-id",
      status: "COMPLETED",
      amount: { currency_code: "USD", value: "19.99" },
      links: [{ rel: "up", href: "https://api-m.sandbox.paypal.com/v2/payments/captures/capture-id" }],
    })).toEqual({
      refundId: "refund-id",
      captureId: "capture-id",
      currency: "USD",
      amount: "19.99",
    });
  });

  it("rejects incomplete refunds", () => {
    expect(completedRefund({ id: "refund-id", status: "PENDING" })).toBeNull();
  });
});

describe("revokeRefundedPayPalOrder", () => {
  function databaseFor(amount: string, status = "completed") {
    const statements: Array<{ sql: string; values: unknown[] }> = [];
    return {
      statements,
      database: {
        prepare: (sql: string) => {
          const statement = {
            sql,
            values: [] as unknown[],
            bind(...values: unknown[]) {
              statement.values = values;
              statements.push(statement);
              return statement;
            },
            first: async () => ({
              id: "local-order",
              user_id: "user-id",
              amount_usd: "19.99",
              currency: "USD",
              credits: 40,
              status,
              paypal_capture_id: "capture-id",
            }),
          };
          return statement;
        },
        batch: async () => [],
      },
      input: {
        captureId: "capture-id",
        refundId: "refund-id",
        currency: "USD",
        amount,
      },
    };
  }

  it("revokes unused credits after a full refund", async () => {
    const fixture = databaseFor("19.99");
    await expect(revokeRefundedPayPalOrder({
      database: fixture.database as never,
      ...fixture.input,
    })).resolves.toBe(true);

    expect(fixture.statements.some((statement) => statement.sql.includes("credits_used = credits_total"))).toBe(true);
    expect(fixture.statements.some((statement) => statement.sql.includes("status = 'refunded'"))).toBe(true);
    expect(fixture.statements.some((statement) => statement.sql.includes("status = 'revoked'"))).toBe(true);
  });

  it("does not revoke the credit pack after a partial refund", async () => {
    const fixture = databaseFor("5.00");
    await expect(revokeRefundedPayPalOrder({
      database: fixture.database as never,
      ...fixture.input,
    })).resolves.toBe(true);

    expect(fixture.statements).toHaveLength(1);
  });
});
