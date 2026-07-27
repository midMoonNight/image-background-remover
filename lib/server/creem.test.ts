import { describe, expect, it } from "vitest";

import {
  finalizeCreemOrder,
  revokeRefundedCreemOrder,
  verifyCreemWebhook,
} from "@/lib/server/creem";

describe("verifyCreemWebhook", () => {
  it("accepts the HMAC-SHA256 signature of the raw body", async () => {
    const rawBody = '{"eventType":"checkout.completed"}';
    const secret = "webhook-secret";
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
    const signature = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

    await expect(verifyCreemWebhook(rawBody, signature, secret)).resolves.toBe(true);
    await expect(verifyCreemWebhook(`${rawBody} `, signature, secret)).resolves.toBe(false);
  });
});

describe("finalizeCreemOrder", () => {
  it("accepts an identical replay for a completed order", async () => {
    const database = {
      prepare: () => ({
        bind() { return this; },
        first: async () => ({
          id: "local-order",
          user_id: "user-id",
          creem_product_id: "product-id",
          amount_cents: 1999,
          currency: "USD",
          credits: 40,
          status: "completed",
          creem_order_id: "creem-order",
        }),
      }),
      batch: async () => { throw new Error("batch should not run"); },
    };

    await expect(finalizeCreemOrder({
      database: database as never,
      payment: {
        checkoutId: "checkout-id",
        orderId: "creem-order",
        productId: "product-id",
        amountCents: 1999,
        currency: "USD",
      },
    })).resolves.toBe(true);
  });

  it("rejects a mismatched amount", async () => {
    const database = {
      prepare: () => ({
        bind() { return this; },
        first: async () => ({
          id: "local-order",
          user_id: "user-id",
          creem_product_id: "product-id",
          amount_cents: 1999,
          currency: "USD",
          credits: 40,
          status: "created",
          creem_order_id: null,
        }),
      }),
      batch: async () => [],
    };

    await expect(finalizeCreemOrder({
      database: database as never,
      payment: {
        checkoutId: "checkout-id",
        orderId: "creem-order",
        productId: "product-id",
        amountCents: 599,
        currency: "USD",
      },
    })).rejects.toThrow("does not match");
  });
});

describe("revokeRefundedCreemOrder", () => {
  function fixture(refundAmountCents: number) {
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
              creem_product_id: "product-id",
              amount_cents: 1999,
              currency: "USD",
              credits: 40,
              status: "completed",
              creem_order_id: "creem-order",
            }),
          };
          return statement;
        },
        batch: async () => [],
      },
      input: {
        orderId: "creem-order",
        refundId: "refund-id",
        currency: "USD",
        refundAmountCents,
      },
    };
  }

  it("revokes unused credits after a full refund", async () => {
    const test = fixture(1999);
    await expect(revokeRefundedCreemOrder({
      database: test.database as never,
      ...test.input,
    })).resolves.toBe(true);

    expect(test.statements.some((statement) => statement.sql.includes("credits_used = credits_total"))).toBe(true);
    expect(test.statements.some((statement) => statement.sql.includes("status = 'refunded'"))).toBe(true);
  });

  it("does not revoke credits after a partial refund", async () => {
    const test = fixture(500);
    await expect(revokeRefundedCreemOrder({
      database: test.database as never,
      ...test.input,
    })).resolves.toBe(true);

    expect(test.statements).toHaveLength(1);
  });
});
