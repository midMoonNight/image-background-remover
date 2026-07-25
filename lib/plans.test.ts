import { describe, expect, it } from "vitest";

import { CREDIT_VALID_DAYS, getPaidPlan } from "@/lib/plans";

describe("paid plans", () => {
  it.each([
    ["starter", "5.99", 10],
    ["seller", "19.99", 40],
    ["business", "39.99", 100],
  ] as const)("keeps %s pricing on the server", (id, amount, credits) => {
    expect(getPaidPlan(id)).toMatchObject({ id, amount, credits });
  });

  it("rejects unknown plan identifiers", () => {
    expect(getPaidPlan("business&amount=0.01")).toBeNull();
  });

  it("uses a 30-day monthly allowance", () => {
    expect(CREDIT_VALID_DAYS).toBe(30);
  });
});
