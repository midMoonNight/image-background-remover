import type { AuthDatabase, AuthEnvironment, AuthUser } from "@/lib/server/auth";
import { CREDIT_VALID_DAYS, type PaidPlan, type PaidPlanId } from "@/lib/plans";

export type CreemEnvironment = AuthEnvironment & {
  CREEM_API_KEY: string;
};

type CreemCheckoutResponse = {
  id?: string;
  checkout_url?: string;
};

type LocalCreemOrder = {
  id: string;
  user_id: string;
  creem_product_id: string;
  amount_cents: number;
  currency: string;
  credits: number;
  status: string;
  creem_order_id: string | null;
};

export type CompletedCreemCheckout = {
  checkoutId: string;
  orderId: string;
  transactionId?: string | null;
  productId: string;
  amountCents: number;
  currency: string;
};

function apiBase(env: AuthEnvironment): string {
  return env.CREEM_ENV === "live" ? "https://api.creem.io" : "https://test-api.creem.io";
}

export function creemProductId(env: AuthEnvironment, planId: PaidPlanId): string | null {
  const ids = {
    starter: env.CREEM_STARTER_PRODUCT_ID,
    seller: env.CREEM_SELLER_PRODUCT_ID,
    business: env.CREEM_BUSINESS_PRODUCT_ID,
  };
  return ids[planId]?.trim() || null;
}

export async function createCreemCheckout(input: {
  env: CreemEnvironment;
  plan: PaidPlan;
  productId: string;
  localOrderId: string;
  origin: string;
  user: AuthUser;
}): Promise<{ checkoutId: string; checkoutUrl: string }> {
  const response = await fetch(`${apiBase(input.env)}/v1/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": input.env.CREEM_API_KEY,
    },
    body: JSON.stringify({
      request_id: input.localOrderId,
      product_id: input.productId,
      units: 1,
      customer: { email: input.user.email },
      success_url: `${input.origin}/payment/success?provider=creem`,
      metadata: {
        localOrderId: input.localOrderId,
        userId: input.user.id,
        planId: input.plan.id,
      },
    }),
  });
  if (!response.ok) throw new Error("Creem checkout creation failed");
  const checkout = (await response.json()) as CreemCheckoutResponse;
  if (!checkout.id || !checkout.checkout_url) throw new Error("Creem checkout URL is missing");
  return { checkoutId: checkout.id, checkoutUrl: checkout.checkout_url };
}

function cents(amount: string): number {
  return Number(amount.replace(".", ""));
}

export async function finalizeCreemOrder(input: {
  database: AuthDatabase;
  payment: CompletedCreemCheckout;
}): Promise<boolean> {
  const order = await input.database
    .prepare(
      `SELECT id, user_id, creem_product_id, amount_cents, currency, credits, status, creem_order_id
       FROM creem_orders WHERE creem_checkout_id = ?`,
    )
    .bind(input.payment.checkoutId)
    .first<LocalCreemOrder>();
  if (!order) return false;
  if (
    input.payment.productId !== order.creem_product_id ||
    input.payment.amountCents !== order.amount_cents ||
    input.payment.currency !== order.currency
  ) {
    throw new Error("Creem payment does not match the local order");
  }
  if (order.status === "completed") {
    if (order.creem_order_id !== input.payment.orderId) {
      throw new Error("Creem checkout was already completed with another order");
    }
    return true;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CREDIT_VALID_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await input.database.batch([
    input.database
      .prepare(
        `INSERT OR IGNORE INTO credit_grants
          (id, user_id, creem_order_id, source, credits_total, credits_used, created_at, expires_at)
         VALUES (?, ?, ?, 'creem', ?, 0, ?, ?)`,
      )
      .bind(crypto.randomUUID(), order.user_id, order.id, order.credits, now.toISOString(), expiresAt),
    input.database
      .prepare(
        `INSERT OR IGNORE INTO credit_ledger
          (id, user_id, grant_id, event_type, delta, reference_id, created_at)
         SELECT ?, ?, id, 'purchase', ?, ?, ? FROM credit_grants WHERE creem_order_id = ?`,
      )
      .bind(crypto.randomUUID(), order.user_id, order.credits, input.payment.orderId, now.toISOString(), order.id),
    input.database
      .prepare(
        `UPDATE creem_orders
         SET creem_order_id = ?, creem_transaction_id = ?, status = 'completed', updated_at = ?, completed_at = ?
         WHERE id = ? AND status != 'completed'`,
      )
      .bind(
        input.payment.orderId,
        input.payment.transactionId ?? null,
        now.toISOString(),
        now.toISOString(),
        order.id,
      ),
  ]);
  return true;
}

export async function revokeRefundedCreemOrder(input: {
  database: AuthDatabase;
  orderId: string;
  refundId: string;
  currency: string;
  refundAmountCents: number;
}): Promise<boolean> {
  const order = await input.database
    .prepare(
      `SELECT id, user_id, creem_product_id, amount_cents, currency, credits, status, creem_order_id
       FROM creem_orders WHERE creem_order_id = ?`,
    )
    .bind(input.orderId)
    .first<LocalCreemOrder>();
  if (!order) return false;
  if (input.currency !== order.currency || input.refundAmountCents < 0) {
    throw new Error("Creem refund does not match the local order");
  }
  if (input.refundAmountCents < order.amount_cents || order.status === "refunded") return true;

  const now = new Date().toISOString();
  await input.database.batch([
    input.database
      .prepare(
        `INSERT OR IGNORE INTO credit_ledger
          (id, user_id, grant_id, event_type, delta, reference_id, created_at)
         SELECT ?, user_id, id, 'payment_refunded', -(credits_total - credits_used), ?, ?
         FROM credit_grants WHERE creem_order_id = ?`,
      )
      .bind(crypto.randomUUID(), input.refundId, now, order.id),
    input.database
      .prepare(
        `UPDATE credit_grants SET credits_used = credits_total
         WHERE creem_order_id = ? AND credits_used < credits_total`,
      )
      .bind(order.id),
    input.database
      .prepare(
        `UPDATE credit_reservations SET status = 'revoked', updated_at = ?
         WHERE grant_id IN (SELECT id FROM credit_grants WHERE creem_order_id = ?) AND status = 'pending'`,
      )
      .bind(now, order.id),
    input.database
      .prepare("UPDATE creem_orders SET status = 'refunded', updated_at = ? WHERE id = ? AND status = 'completed'")
      .bind(now, order.id),
  ]);
  return true;
}

function hex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyCreemWebhook(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const computed = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
  return constantTimeEqual(computed.toLowerCase(), signature.toLowerCase());
}

export function planAmountCents(plan: PaidPlan): number {
  return cents(plan.amount);
}
