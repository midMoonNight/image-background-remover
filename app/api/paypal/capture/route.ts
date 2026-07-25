import { NextRequest, NextResponse } from "next/server";

import { getSessionUser, SESSION_COOKIE } from "@/lib/server/auth";
import { getAuthEnvironment } from "@/lib/server/auth-context";
import {
  capturePayPalOrder,
  completedCapture,
  finalizePayPalOrder,
  type PayPalEnvironment,
} from "@/lib/server/paypal";

export const runtime = "nodejs";

function pricingRedirect(origin: string, status: string) {
  return NextResponse.redirect(new URL(`/pricing?payment=${status}`, origin));
}

export async function GET(request: NextRequest) {
  const env = getAuthEnvironment();
  const origin = request.nextUrl.origin;
  if (!env.AUTH_DB || !env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    return pricingRedirect(origin, "error");
  }
  const user = await getSessionUser(env.AUTH_DB, request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return pricingRedirect(origin, "signin");

  const paypalOrderId = request.nextUrl.searchParams.get("token");
  if (!paypalOrderId) return pricingRedirect(origin, "error");
  try {
    const capture = completedCapture(await capturePayPalOrder(env as PayPalEnvironment, paypalOrderId));
    if (!capture) throw new Error("PayPal capture was not completed");
    const finalized = await finalizePayPalOrder({
      database: env.AUTH_DB,
      paypalOrderId,
      payment: capture,
      expectedUserId: user.id,
    });
    if (!finalized) throw new Error("Local PayPal order was not found");
    return NextResponse.redirect(new URL("/payment/success", origin));
  } catch {
    return pricingRedirect(origin, "error");
  }
}
