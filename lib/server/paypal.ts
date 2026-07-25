import type { AuthDatabase, AuthEnvironment } from "@/lib/server/auth";
import { CREDIT_VALID_DAYS, type PaidPlan } from "@/lib/plans";

export type PayPalEnvironment = AuthEnvironment & {
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
};

type PayPalOrderResponse = {
  id: string;
  status: string;
  links?: Array<{ href: string; rel: string }>;
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: { captures?: Array<{ id: string; status: string; amount?: { currency_code?: string; value?: string } }> };
  }>;
};

function baseUrl(env: AuthEnvironment): string {
  return env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function encodeBasic(clientId: string, clientSecret: string): string {
  return btoa(`${clientId}:${clientSecret}`);
}

async function accessToken(env: PayPalEnvironment): Promise<string> {
  const response = await fetch(`${baseUrl(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodeBasic(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error("PayPal authentication failed");
  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("PayPal access token is missing");
  return body.access_token;
}

export async function createPayPalOrder(input: {
  env: PayPalEnvironment;
  plan: PaidPlan;
  localOrderId: string;
  origin: string;
}): Promise<{ paypalOrderId: string; approvalUrl: string }> {
  const token = await accessToken(input.env);
  const response = await fetch(`${baseUrl(input.env)}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": input.localOrderId,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.localOrderId,
          custom_id: input.localOrderId,
          invoice_id: input.localOrderId,
          description: `Clearcut ${input.plan.name} - ${input.plan.credits} image credits`,
          amount: { currency_code: "USD", value: input.plan.amount },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Clearcut",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: `${input.origin}/api/paypal/capture`,
            cancel_url: `${input.origin}/pricing?payment=cancelled`,
          },
        },
      },
    }),
  });
  if (!response.ok) throw new Error("PayPal order creation failed");
  const order = (await response.json()) as PayPalOrderResponse;
  const approvalUrl = order.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href;
  if (!order.id || !approvalUrl) throw new Error("PayPal approval link is missing");
  return { paypalOrderId: order.id, approvalUrl };
}

async function getPayPalOrder(env: PayPalEnvironment, orderId: string, token: string) {
  const response = await fetch(`${baseUrl(env)}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("PayPal order lookup failed");
  return (await response.json()) as PayPalOrderResponse;
}

export async function capturePayPalOrder(
  env: PayPalEnvironment,
  orderId: string,
): Promise<PayPalOrderResponse> {
  const token = await accessToken(env);
  const response = await fetch(`${baseUrl(env)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (response.ok) return (await response.json()) as PayPalOrderResponse;

  const existing = await getPayPalOrder(env, orderId, token);
  if (existing.status !== "COMPLETED") throw new Error("PayPal capture failed");
  return existing;
}

export function completedCapture(order: PayPalOrderResponse): {
  captureId: string;
  currency: string;
  amount: string;
  referenceId: string | null;
} | null {
  if (order.status !== "COMPLETED") return null;
  const capture = order.purchase_units?.[0]?.payments?.captures?.find((item) => item.status === "COMPLETED");
  const amount = capture?.amount;
  if (!capture?.id || !amount?.currency_code || !amount.value) return null;
  return {
    captureId: capture.id,
    currency: amount.currency_code,
    amount: amount.value,
    referenceId: order.purchase_units?.[0]?.reference_id ?? order.purchase_units?.[0]?.custom_id ?? null,
  };
}

type LocalOrder = {
  id: string;
  user_id: string;
  amount_usd: string;
  currency: string;
  credits: number;
  status: string;
  paypal_capture_id: string | null;
};

type PayPalRefundResource = {
  id?: string;
  status?: string;
  amount?: { currency_code?: string; value?: string };
  supplementary_data?: { related_ids?: { capture_id?: string } };
  links?: Array<{ href?: string; rel?: string }>;
};

export type CompletedPayment = {
  captureId: string;
  currency: string;
  amount: string;
  referenceId?: string | null;
};

export async function finalizePayPalOrder(input: {
  database: AuthDatabase;
  paypalOrderId: string;
  payment: CompletedPayment;
  expectedUserId?: string;
}): Promise<boolean> {
  const order = await input.database
    .prepare(
      `SELECT id, user_id, amount_usd, currency, credits, status, paypal_capture_id
       FROM paypal_orders WHERE paypal_order_id = ?`,
    )
    .bind(input.paypalOrderId)
    .first<LocalOrder>();
  if (!order || (input.expectedUserId && order.user_id !== input.expectedUserId)) return false;
  if (
    input.payment.currency !== order.currency ||
    input.payment.amount !== order.amount_usd ||
    (input.payment.referenceId && input.payment.referenceId !== order.id)
  ) {
    throw new Error("PayPal payment does not match the local order");
  }
  if (order.status === "completed") {
    if (order.paypal_capture_id !== input.payment.captureId) {
      throw new Error("PayPal order was already completed with another capture");
    }
    return true;
  }

  const now = new Date();
  const grantId = crypto.randomUUID();
  const expiresAt = new Date(now.getTime() + CREDIT_VALID_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await input.database.batch([
    input.database
      .prepare(
        `INSERT OR IGNORE INTO credit_grants
          (id, user_id, order_id, source, credits_total, credits_used, created_at, expires_at)
         VALUES (?, ?, ?, 'paypal', ?, 0, ?, ?)`,
      )
      .bind(grantId, order.user_id, order.id, order.credits, now.toISOString(), expiresAt),
    input.database
      .prepare(
        `INSERT OR IGNORE INTO credit_ledger
          (id, user_id, grant_id, event_type, delta, reference_id, created_at)
         SELECT ?, ?, id, 'purchase', ?, ?, ? FROM credit_grants WHERE order_id = ?`,
      )
      .bind(
        crypto.randomUUID(),
        order.user_id,
        order.credits,
        input.payment.captureId,
        now.toISOString(),
        order.id,
      ),
    input.database
      .prepare(
        `UPDATE paypal_orders
         SET paypal_capture_id = ?, status = 'completed', updated_at = ?, captured_at = ?
         WHERE id = ? AND status != 'completed'`,
      )
      .bind(input.payment.captureId, now.toISOString(), now.toISOString(), order.id),
  ]);
  return true;
}

export function completedRefund(resource: PayPalRefundResource): {
  refundId: string;
  captureId: string;
  currency: string;
  amount: string;
} | null {
  if (resource.status !== "COMPLETED") return null;
  const captureUrl = resource.links?.find((link) => link.rel === "up")?.href;
  const captureId = resource.supplementary_data?.related_ids?.capture_id
    ?? captureUrl?.match(/\/captures\/([^/?#]+)/)?.[1];
  if (!resource.id || !captureId || !resource.amount?.currency_code || !resource.amount.value) return null;
  return {
    refundId: resource.id,
    captureId: decodeURIComponent(captureId),
    currency: resource.amount.currency_code,
    amount: resource.amount.value,
  };
}

function amountInCents(value: string): number | null {
  if (!/^\d+\.\d{2}$/.test(value)) return null;
  const cents = Number(value.replace(".", ""));
  return Number.isSafeInteger(cents) ? cents : null;
}

export async function revokeRefundedPayPalOrder(input: {
  database: AuthDatabase;
  captureId: string;
  refundId: string;
  currency: string;
  amount: string;
}): Promise<boolean> {
  const order = await input.database
    .prepare(
      `SELECT id, user_id, amount_usd, currency, credits, status, paypal_capture_id
       FROM paypal_orders WHERE paypal_capture_id = ?`,
    )
    .bind(input.captureId)
    .first<LocalOrder>();
  if (!order) return false;
  if (input.currency !== order.currency) throw new Error("PayPal refund currency does not match the local order");

  const refundCents = amountInCents(input.amount);
  const orderCents = amountInCents(order.amount_usd);
  if (refundCents === null || orderCents === null || refundCents > orderCents) {
    throw new Error("PayPal refund amount is invalid");
  }
  if (refundCents < orderCents || order.status === "refunded") return true;

  const now = new Date().toISOString();
  await input.database.batch([
    input.database
      .prepare(
        `INSERT OR IGNORE INTO credit_ledger
          (id, user_id, grant_id, event_type, delta, reference_id, created_at)
         SELECT ?, user_id, id, 'payment_refunded', -(credits_total - credits_used), ?, ?
         FROM credit_grants WHERE order_id = ?`,
      )
      .bind(crypto.randomUUID(), input.refundId, now, order.id),
    input.database
      .prepare(
        `UPDATE credit_grants SET credits_used = credits_total
         WHERE order_id = ? AND credits_used < credits_total`,
      )
      .bind(order.id),
    input.database
      .prepare(
        `UPDATE credit_reservations SET status = 'revoked', updated_at = ?
         WHERE grant_id IN (SELECT id FROM credit_grants WHERE order_id = ?) AND status = 'pending'`,
      )
      .bind(now, order.id),
    input.database
      .prepare(
        `UPDATE paypal_orders SET status = 'refunded', updated_at = ?
         WHERE id = ? AND status = 'completed'`,
      )
      .bind(now, order.id),
  ]);
  return true;
}

export async function verifyPayPalWebhook(input: {
  env: PayPalEnvironment & { PAYPAL_WEBHOOK_ID: string };
  headers: Headers;
  event: unknown;
}): Promise<boolean> {
  const transmissionId = input.headers.get("paypal-transmission-id");
  const transmissionTime = input.headers.get("paypal-transmission-time");
  const transmissionSig = input.headers.get("paypal-transmission-sig");
  const certUrl = input.headers.get("paypal-cert-url");
  const authAlgo = input.headers.get("paypal-auth-algo");
  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) return false;

  const token = await accessToken(input.env);
  const response = await fetch(`${baseUrl(input.env)}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: input.env.PAYPAL_WEBHOOK_ID,
      webhook_event: input.event,
    }),
  });
  if (!response.ok) return false;
  const result = (await response.json()) as { verification_status?: string };
  return result.verification_status === "SUCCESS";
}
