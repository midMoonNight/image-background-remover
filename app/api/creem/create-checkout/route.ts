import { NextRequest, NextResponse } from "next/server";

import { allowedRequestOrigin, getSessionUser, SESSION_COOKIE } from "@/lib/server/auth";
import { getAuthEnvironment } from "@/lib/server/auth-context";
import {
  createCreemCheckout,
  creemProductId,
  planAmountCents,
  type CreemEnvironment,
} from "@/lib/server/creem";
import { getPaidPlan } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const env = getAuthEnvironment();
  const origin = request.headers.get("origin");
  if (!origin || !allowedRequestOrigin(origin, env.ALLOWED_ORIGIN)) {
    return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
  }
  if (!env.AUTH_DB || !env.CREEM_API_KEY) {
    return NextResponse.json({ message: "Creem checkout is unavailable." }, { status: 503 });
  }

  const user = await getSessionUser(env.AUTH_DB, request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ message: "Sign in before purchasing." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { planId?: unknown } | null;
  const plan = getPaidPlan(body?.planId);
  if (!plan) return NextResponse.json({ message: "Invalid plan." }, { status: 400 });
  const productId = creemProductId(env, plan.id);
  if (!productId) return NextResponse.json({ message: "Creem product is unavailable." }, { status: 503 });

  const localOrderId = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.AUTH_DB
    .prepare(
      `INSERT INTO creem_orders
        (id, user_id, plan_id, creem_product_id, amount_cents, currency, credits, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'USD', ?, 'creating', ?, ?)`,
    )
    .bind(localOrderId, user.id, plan.id, productId, planAmountCents(plan), plan.credits, now, now)
    .run();

  try {
    const checkout = await createCreemCheckout({
      env: env as CreemEnvironment,
      plan,
      productId,
      localOrderId,
      origin,
      user,
    });
    await env.AUTH_DB
      .prepare("UPDATE creem_orders SET creem_checkout_id = ?, status = 'created', updated_at = ? WHERE id = ?")
      .bind(checkout.checkoutId, new Date().toISOString(), localOrderId)
      .run();
    return NextResponse.json({ checkoutUrl: checkout.checkoutUrl });
  } catch (error) {
    console.error("Creem checkout creation failed:", error instanceof Error ? error.message : "Unknown error");
    await env.AUTH_DB
      .prepare("UPDATE creem_orders SET status = 'create_failed', updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), localOrderId)
      .run();
    return NextResponse.json({ message: "Could not start Creem checkout." }, { status: 502 });
  }
}
