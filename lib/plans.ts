export const CREDIT_VALID_DAYS = 30;

export const PAID_PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    amount: "5.99",
    credits: 10,
  },
  seller: {
    id: "seller",
    name: "Seller",
    amount: "19.99",
    credits: 40,
  },
  business: {
    id: "business",
    name: "Business",
    amount: "39.99",
    credits: 100,
  },
} as const;

export type PaidPlanId = keyof typeof PAID_PLANS;
export type PaidPlan = (typeof PAID_PLANS)[PaidPlanId];

export function getPaidPlan(value: unknown): PaidPlan | null {
  if (typeof value !== "string" || !(value in PAID_PLANS)) return null;
  return PAID_PLANS[value as PaidPlanId];
}
