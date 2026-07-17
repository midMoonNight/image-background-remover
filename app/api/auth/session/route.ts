import { NextRequest, NextResponse } from "next/server";

import { getSessionUser, SESSION_COOKIE } from "@/lib/server/auth";
import { getAuthEnvironment } from "@/lib/server/auth-context";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const env = getAuthEnvironment();
  if (!env.AUTH_DB) {
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const user = await getSessionUser(env.AUTH_DB, request.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
}
