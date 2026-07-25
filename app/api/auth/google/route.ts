import { NextRequest, NextResponse } from "next/server";

import {
  allowedRequestOrigin,
  createPkceChallenge,
  googleAuthorizationUrl,
  OAUTH_COOKIE_MAX_AGE_SECONDS,
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  randomToken,
} from "@/lib/server/auth";
import { getAuthEnvironment } from "@/lib/server/auth-context";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const env = getAuthEnvironment();
  const origin = request.nextUrl.origin;
  if (!env.GOOGLE_CLIENT_ID || !allowedRequestOrigin(origin, env.ALLOWED_ORIGIN)) {
    return NextResponse.json({ message: "Google login is unavailable." }, { status: 503 });
  }

  const state = randomToken();
  const verifier = randomToken(48);
  const returnTo = request.nextUrl.searchParams.get("returnTo");
  const redirectUri = `${origin}/api/auth/google/callback`;
  const response = NextResponse.redirect(
    googleAuthorizationUrl({
      clientId: env.GOOGLE_CLIENT_ID,
      redirectUri,
      state,
      codeChallenge: await createPkceChallenge(verifier),
    }),
  );
  const cookieOptions = {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  };
  response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions);
  response.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, cookieOptions);
  if (returnTo) response.cookies.set(OAUTH_RETURN_COOKIE, returnTo, cookieOptions);
  return response;
}
