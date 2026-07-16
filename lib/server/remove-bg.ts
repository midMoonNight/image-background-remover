import { APP_ERROR_MESSAGES, type AppErrorCode } from "@/lib/constants";

export type RemoveBgEnvironment = {
  REMOVE_BG_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  ALLOWED_ORIGIN?: string;
  MAX_FILE_SIZE_BYTES?: string;
};

export function isAllowedOrigin(origin: string | null, allowedOrigins?: string): boolean {
  if (!origin || !allowedOrigins?.trim()) return true;

  return allowedOrigins
    .split(",")
    .map((allowedOrigin) => allowedOrigin.trim())
    .filter(Boolean)
    .includes(origin);
}

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });

  if (!response.ok) return false;
  const result = (await response.json()) as TurnstileResponse;
  return result.success === true;
}

export function mapRemoveBgStatus(status: number): AppErrorCode {
  if (status === 402) return "UPSTREAM_QUOTA_EXCEEDED";
  if (status === 429) return "UPSTREAM_RATE_LIMITED";
  if (status >= 500) return "UPSTREAM_UNAVAILABLE";
  if (status >= 400) return "UPSTREAM_REJECTED";
  return "PROCESSING_FAILED";
}

export function errorBody(code: AppErrorCode) {
  return { code, message: APP_ERROR_MESSAGES[code] };
}
