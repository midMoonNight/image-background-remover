import { NextRequest, NextResponse } from "next/server";

import { getAuthEnvironment } from "@/lib/server/auth-context";
import {
  completedRefund,
  finalizePayPalOrder,
  revokeRefundedPayPalOrder,
  verifyPayPalWebhook,
  type PayPalEnvironment,
} from "@/lib/server/paypal";

export const runtime = "nodejs";

type CaptureEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    amount?: { currency_code?: string; value?: string };
    custom_id?: string;
    supplementary_data?: { related_ids?: { order_id?: string; capture_id?: string } };
    links?: Array<{ href?: string; rel?: string }>;
  };
};

export async function POST(request: NextRequest) {
  const env = getAuthEnvironment();
  if (!env.AUTH_DB || !env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET || !env.PAYPAL_WEBHOOK_ID) {
    return NextResponse.json({ message: "Webhook is unavailable." }, { status: 503 });
  }

  const event = (await request.json().catch(() => null)) as CaptureEvent | null;
  if (!event?.id || !event.event_type) {
    return NextResponse.json({ message: "Invalid webhook event." }, { status: 400 });
  }
  const verified = await verifyPayPalWebhook({
    env: env as PayPalEnvironment & { PAYPAL_WEBHOOK_ID: string },
    headers: request.headers,
    event,
  });
  if (!verified) return NextResponse.json({ message: "Invalid signature." }, { status: 401 });

  const now = new Date().toISOString();
  const claimed = await env.AUTH_DB
    .prepare(
      `INSERT INTO paypal_webhook_events (id, event_type, status, created_at, updated_at)
       VALUES (?, ?, 'processing', ?, ?)
       ON CONFLICT(id) DO UPDATE SET status = 'processing', updated_at = excluded.updated_at
       WHERE paypal_webhook_events.status = 'failed'`,
    )
    .bind(event.id, event.event_type, now, now)
    .run();
  if ((claimed.meta?.changes ?? 0) === 0) return NextResponse.json({ ok: true });

  try {
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource;
      const paypalOrderId = resource?.supplementary_data?.related_ids?.order_id;
      if (
        !paypalOrderId ||
        !resource?.id ||
        resource.status !== "COMPLETED" ||
        !resource.amount?.currency_code ||
        !resource.amount.value
      ) {
        throw new Error("Incomplete capture event");
      }
      const finalized = await finalizePayPalOrder({
        database: env.AUTH_DB,
        paypalOrderId,
        payment: {
          captureId: resource.id,
          currency: resource.amount.currency_code,
          amount: resource.amount.value,
          referenceId: resource.custom_id ?? null,
        },
      });
      if (!finalized) throw new Error("Local PayPal order was not found");
    }

    if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
      const refund = completedRefund(event.resource ?? {});
      if (!refund) throw new Error("Incomplete refund event");
      const revoked = await revokeRefundedPayPalOrder({ database: env.AUTH_DB, ...refund });
      if (!revoked) throw new Error("Local PayPal order was not found");
    }

    await env.AUTH_DB
      .prepare("UPDATE paypal_webhook_events SET status = 'processed', updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), event.id)
      .run();
    return NextResponse.json({ ok: true });
  } catch {
    await env.AUTH_DB
      .prepare("UPDATE paypal_webhook_events SET status = 'failed', updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), event.id)
      .run();
    return NextResponse.json({ message: "Webhook processing failed." }, { status: 500 });
  }
}
