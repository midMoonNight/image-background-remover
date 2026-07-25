import { NextRequest, NextResponse } from "next/server";

import { allowedRequestOrigin, getSessionUser, SESSION_COOKIE } from "@/lib/server/auth";
import { getAuthEnvironment } from "@/lib/server/auth-context";
import { createPayPalOrder, type PayPalEnvironment } from "@/lib/server/paypal";
import { getPaidPlan } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const env = getAuthEnvironment();
  const origin = request.headers.get("origin");
  if (!origin || !allowedRequestOrigin(origin, env.ALLOWED_ORIGIN)) {
    return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
  }
  if (!env.AUTH_DB || !env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    return NextResponse.json({ message: "PayPal checkout is unavailable." }, { status: 503 });
  }

  const user = await getSessionUser(env.AUTH_DB, request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ message: "Sign in before purchasing." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { planId?: unknown } | null;
  const plan = getPaidPlan(body?.planId);
  if (!plan) return NextResponse.json({ message: "Invalid plan." }, { status: 400 });

  const localOrderId = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.AUTH_DB
    .prepare(
      `INSERT INTO paypal_orders
        (id, user_id, plan_id, amount_usd, currency, credits, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'USD', ?, 'creating', ?, ?)`,
    )
    .bind(localOrderId, user.id, plan.id, plan.amount, plan.credits, now, now)
    .run();

  try {
    const paypal = await createPayPalOrder({
      env: env as PayPalEnvironment,
      plan,
      localOrderId,
      origin,
    });
    await env.AUTH_DB
      .prepare("UPDATE paypal_orders SET paypal_order_id = ?, status = 'created', updated_at = ? WHERE id = ?")
      .bind(paypal.paypalOrderId, new Date().toISOString(), localOrderId)
      .run();
    return NextResponse.json({ approvalUrl: paypal.approvalUrl });
  } catch (error) {
    console.error("PayPal order creation failed:", error instanceof Error ? error.message : "Unknown error");
    await env.AUTH_DB
      .prepare("UPDATE paypal_orders SET status = 'create_failed', updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), localOrderId)
      .run();
    return NextResponse.json({ message: "Could not start PayPal checkout." }, { status: 502 });
  }
}
