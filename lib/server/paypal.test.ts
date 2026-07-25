import { describe, expect, it } from "vitest";

import { completedCapture, finalizePayPalOrder } from "@/lib/server/paypal";

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
