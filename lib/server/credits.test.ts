import { describe, expect, it } from "vitest";

import { getCreditBreakdown } from "@/lib/server/credits";

describe("getCreditBreakdown", () => {
  it("returns paid, free, and total active credits", async () => {
    let query = "";
    const database = {
      prepare: (sql: string) => {
        query = sql;
        return {
          bind() { return this; },
          first: async () => ({ total: 42, paid: 40, free: 2 }),
        };
      },
    };

    await expect(getCreditBreakdown(database as never, "user-id")).resolves.toEqual({
      total: 42,
      paid: 40,
      free: 2,
    });
    expect(query).toContain("source IN ('paypal', 'creem')");
  });

  it("returns zeroes when no active grants exist", async () => {
    const database = {
      prepare: () => ({
        bind() { return this; },
        first: async () => null,
      }),
    };

    await expect(getCreditBreakdown(database as never, "user-id")).resolves.toEqual({
      total: 0,
      paid: 0,
      free: 0,
    });
  });
});
