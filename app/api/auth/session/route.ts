import { NextRequest, NextResponse } from "next/server";

import { getSessionUser, SESSION_COOKIE } from "@/lib/server/auth";
import { getCreditBreakdown, grantFreeTrial } from "@/lib/server/credits";
import { getAuthEnvironment } from "@/lib/server/auth-context";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const env = getAuthEnvironment();
  if (!env.AUTH_DB) {
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const user = await getSessionUser(env.AUTH_DB, request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json(
      { user: null, credits: 0, creditBreakdown: { total: 0, paid: 0, free: 0 } },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  await grantFreeTrial(env.AUTH_DB, user.id);
  const creditBreakdown = await getCreditBreakdown(env.AUTH_DB, user.id);
  return NextResponse.json(
    { user, credits: creditBreakdown.total, creditBreakdown },
    { headers: { "Cache-Control": "no-store" } },
  );
}
