export const SESSION_COOKIE = "listingcut_session";
export const OAUTH_STATE_COOKIE = "listingcut_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "listingcut_oauth_verifier";
export const OAUTH_RETURN_COOKIE = "listingcut_oauth_return";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const OAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

export type AuthEnvironment = {
  AUTH_DB?: AuthDatabase;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  ALLOWED_ORIGIN?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_ENV?: string;
  PAYPAL_WEBHOOK_ID?: string;
};

type D1RunResult = {
  success: boolean;
  meta?: { changes?: number };
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<D1RunResult>;
};

export type AuthDatabase = {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1RunResult[]>;
};

export function safeReturnPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return "/";
  }
  return value;
}

type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomToken(size = 32): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return encodeBase64Url(bytes);
}

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return encodeBase64Url(new Uint8Array(digest));
}

export async function createPkceChallenge(verifier: string): Promise<string> {
  return sha256(verifier);
}

export function allowedRequestOrigin(origin: string, allowedOrigins?: string): boolean {
  if (origin === "http://localhost:3000") return process.env.NODE_ENV !== "production";
  if (!allowedOrigins?.trim()) return false;

  return allowedOrigins
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(origin);
}

export function googleAuthorizationUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: input.state,
    code_challenge: input.codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return url.toString();
}

export async function exchangeGoogleCode(input: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      code: input.code,
      redirect_uri: input.redirectUri,
      code_verifier: input.codeVerifier,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) throw new Error("Google token exchange failed");
  const result = (await response.json()) as { access_token?: string };
  if (!result.access_token) throw new Error("Google access token is missing");
  return result.access_token;
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error("Google profile request failed");
  const profile = (await response.json()) as GoogleProfile;
  if (!profile.sub || !profile.email || profile.email_verified !== true) {
    throw new Error("Google account email is not verified");
  }
  return profile;
}

export async function upsertGoogleUser(
  database: AuthDatabase,
  profile: GoogleProfile,
): Promise<AuthUser> {
  const existing = await database
    .prepare("SELECT id FROM users WHERE google_sub = ?")
    .bind(profile.sub)
    .first<{ id: string }>();
  const id = existing?.id ?? crypto.randomUUID();
  const now = new Date().toISOString();
  const name = profile.name?.trim() || profile.email.split("@")[0];
  const avatarUrl = profile.picture ?? null;

  await database
    .prepare(
      `INSERT INTO users (id, google_sub, email, name, avatar_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(google_sub) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         avatar_url = excluded.avatar_url,
         updated_at = excluded.updated_at`,
    )
    .bind(id, profile.sub, profile.email, name, avatarUrl, now, now)
    .run();

  return { id, email: profile.email, name, avatarUrl };
}

export async function createSession(database: AuthDatabase, userId: string): Promise<string> {
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);

  await database
    .prepare(
      "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
    )
    .bind(tokenHash, userId, now.toISOString(), expiresAt.toISOString())
    .run();
  return token;
}

export async function getSessionUser(
  database: AuthDatabase,
  token: string | undefined,
): Promise<AuthUser | null> {
  if (!token) return null;
  const tokenHash = await sha256(token);
  const user = await database
    .prepare(
      `SELECT users.id, users.email, users.name, users.avatar_url AS avatarUrl
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    )
    .bind(tokenHash, new Date().toISOString())
    .first<AuthUser>();
  return user ?? null;
}

export async function deleteSession(
  database: AuthDatabase,
  token: string | undefined,
): Promise<void> {
  if (!token) return;
  await database.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
}
