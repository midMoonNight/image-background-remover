import { NextRequest, NextResponse } from "next/server";

import { allowedRequestOrigin, deleteSession, SESSION_COOKIE } from "@/lib/server/auth";
import { getAuthEnvironment } from "@/lib/server/auth-context";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const env = getAuthEnvironment();
  const origin = request.headers.get("origin");
  if (!origin || !allowedRequestOrigin(origin, env.ALLOWED_ORIGIN)) {
    return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
  }

  if (env.AUTH_DB) {
    await deleteSession(env.AUTH_DB, request.cookies.get(SESSION_COOKIE)?.value);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
