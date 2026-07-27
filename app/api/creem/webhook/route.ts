import { NextRequest, NextResponse } from "next/server";

import { getAuthEnvironment } from "@/lib/server/auth-context";
import {
  finalizeCreemOrder,
  revokeRefundedCreemOrder,
  verifyCreemWebhook,
} from "@/lib/server/creem";

export const runtime = "nodejs";

type CreemEvent = {
  id?: string;
  eventType?: string;
  object?: {
    id?: string;
    status?: string;
    product?: string | { id?: string };
    order?: {
      id?: string;
      product?: string;
      amount?: number;
      currency?: string;
      status?: string;
      transaction?: string;
    };
    transaction?: { id?: string };
    checkout?: { id?: string };
    refund_amount?: number;
    refund_currency?: string;
  };
};

function productId(value: CreemEvent["object"]): string | null {
  const product = value?.product;
  return typeof product === "string" ? product : product?.id ?? value?.order?.product ?? null;
}

export async function POST(request: NextRequest) {
  const env = getAuthEnvironment();
  if (!env.AUTH_DB || !env.CREEM_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Webhook is unavailable." }, { status: 503 });
  }

  const rawBody = await request.text();
  const verified = await verifyCreemWebhook(
    rawBody,
    request.headers.get("creem-signature"),
    env.CREEM_WEBHOOK_SECRET,
  );
  if (!verified) return NextResponse.json({ message: "Invalid signature." }, { status: 401 });

  let event: CreemEvent;
  try {
    event = JSON.parse(rawBody) as CreemEvent;
  } catch {
    return NextResponse.json({ message: "Invalid webhook event." }, { status: 400 });
  }
  if (!event.id || !event.eventType) {
    return NextResponse.json({ message: "Invalid webhook event." }, { status: 400 });
  }
  const now = new Date().toISOString();
  const claimed = await env.AUTH_DB
    .prepare(
      `INSERT INTO creem_webhook_events (id, event_type, status, created_at, updated_at)
       VALUES (?, ?, 'processing', ?, ?)
       ON CONFLICT(id) DO UPDATE SET status = 'processing', updated_at = excluded.updated_at
       WHERE creem_webhook_events.status = 'failed'`,
    )
    .bind(event.id, event.eventType, now, now)
    .run();
  if ((claimed.meta?.changes ?? 0) === 0) return NextResponse.json({ ok: true });

  try {
    if (event.eventType === "checkout.completed") {
      const checkout = event.object;
      const order = checkout?.order;
      const resolvedProductId = productId(checkout);
      if (
        !checkout?.id ||
        checkout.status !== "completed" ||
        !order?.id ||
        order.status !== "paid" ||
        typeof order.amount !== "number" ||
        !order.currency ||
        !resolvedProductId
      ) {
        throw new Error("Incomplete checkout event");
      }
      const finalized = await finalizeCreemOrder({
        database: env.AUTH_DB,
        payment: {
          checkoutId: checkout.id,
          orderId: order.id,
          transactionId: order.transaction ?? checkout.transaction?.id ?? null,
          productId: resolvedProductId,
          amountCents: order.amount,
          currency: order.currency,
        },
      });
      if (!finalized) throw new Error("Local Creem order was not found");
    }

    if (event.eventType === "refund.created") {
      const refund = event.object;
      if (
        !refund?.id ||
        refund.status !== "succeeded" ||
        !refund.order?.id ||
        typeof refund.refund_amount !== "number" ||
        !refund.refund_currency
      ) {
        throw new Error("Incomplete refund event");
      }
      const revoked = await revokeRefundedCreemOrder({
        database: env.AUTH_DB,
        orderId: refund.order.id,
        refundId: refund.id,
        currency: refund.refund_currency,
        refundAmountCents: refund.refund_amount,
      });
      if (!revoked) throw new Error("Local Creem order was not found");
    }

    await env.AUTH_DB
      .prepare("UPDATE creem_webhook_events SET status = 'processed', updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), event.id)
      .run();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Creem webhook processing failed:", error instanceof Error ? error.message : "Unknown error");
    await env.AUTH_DB
      .prepare("UPDATE creem_webhook_events SET status = 'failed', updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), event.id)
      .run();
    return NextResponse.json({ message: "Webhook processing failed." }, { status: 500 });
  }
}
