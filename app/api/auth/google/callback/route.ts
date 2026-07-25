import { NextRequest, NextResponse } from "next/server";

import {
  allowedRequestOrigin,
  createSession,
  exchangeGoogleCode,
  fetchGoogleProfile,
  OAUTH_STATE_COOKIE,
  OAUTH_RETURN_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  safeReturnPath,
  upsertGoogleUser,
} from "@/lib/server/auth";
import { getAuthEnvironment } from "@/lib/server/auth-context";

export const runtime = "nodejs";

function clearOAuthCookies(response: NextResponse) {
  response.cookies.delete(OAUTH_STATE_COOKIE);
  response.cookies.delete(OAUTH_VERIFIER_COOKIE);
  response.cookies.delete(OAUTH_RETURN_COOKIE);
}

export async function GET(request: NextRequest) {
  const env = getAuthEnvironment();
  const origin = request.nextUrl.origin;
  const errorResponse = NextResponse.redirect(new URL("/?auth_error=google", origin));
  clearOAuthCookies(errorResponse);

  if (
    !env.AUTH_DB ||
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !allowedRequestOrigin(origin, env.ALLOWED_ORIGIN)
  ) {
    return errorResponse;
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const verifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;
  if (!code || !state || !expectedState || state !== expectedState || !verifier) {
    return errorResponse;
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const accessToken = await exchangeGoogleCode({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      code,
      redirectUri,
      codeVerifier: verifier,
    });
    const user = await upsertGoogleUser(env.AUTH_DB, await fetchGoogleProfile(accessToken));
    const sessionToken = await createSession(env.AUTH_DB, user.id);
    const returnTo = safeReturnPath(request.cookies.get(OAUTH_RETURN_COOKIE)?.value ?? null);
    const response = NextResponse.redirect(new URL(returnTo, origin));
    clearOAuthCookies(response);
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch {
    return errorResponse;
  }
}
