import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_MAX_FILE_SIZE } from "@/lib/constants";
import { hasValidImageSignature, validateFile } from "@/lib/file-validation";
import {
  errorBody,
  isAllowedOrigin,
  mapRemoveBgStatus,
  verifyTurnstile,
  type RemoveBgEnvironment,
} from "@/lib/server/remove-bg";

export const runtime = "nodejs";

function jsonError(code: Parameters<typeof errorBody>[0], status: number) {
  return NextResponse.json(errorBody(code), {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getEnvironment(): RemoveBgEnvironment {
  try {
    return getCloudflareContext().env as RemoveBgEnvironment;
  } catch {
    return process.env as RemoveBgEnvironment;
  }
}

export async function POST(request: NextRequest) {
  const env = getEnvironment();
  const origin = request.headers.get("origin");

  if (!isAllowedOrigin(origin, env.ALLOWED_ORIGIN)) {
    return jsonError("VERIFICATION_FAILED", 403);
  }

  if (!env.REMOVE_BG_API_KEY || !env.TURNSTILE_SECRET_KEY) {
    return jsonError("UPSTREAM_UNAVAILABLE", 503);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("INVALID_FILE", 400);
  }

  const image = formData.get("image");
  const turnstileToken = formData.get("turnstileToken");

  if (!(image instanceof File)) return jsonError("INVALID_FILE", 400);
  if (typeof turnstileToken !== "string" || !turnstileToken) {
    return jsonError("VERIFICATION_FAILED", 403);
  }

  const maxFileSize = Number(env.MAX_FILE_SIZE_BYTES) || DEFAULT_MAX_FILE_SIZE;
  const validation = validateFile(image, maxFileSize);
  if (!validation.ok) {
    return NextResponse.json(
      { code: validation.code, message: validation.message },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!(await hasValidImageSignature(image))) {
    return jsonError("INVALID_FILE", 400);
  }

  const remoteIp = request.headers.get("cf-connecting-ip") ?? undefined;
  const verified = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, turnstileToken, remoteIp);
  if (!verified) return jsonError("VERIFICATION_FAILED", 403);

  const upstreamForm = new FormData();
  upstreamForm.append("image_file", image, image.name);
  upstreamForm.append("size", "auto");
  upstreamForm.append("format", "png");

  let upstream: Response;
  try {
    upstream = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": env.REMOVE_BG_API_KEY },
      body: upstreamForm,
    });
  } catch {
    return jsonError("UPSTREAM_UNAVAILABLE", 502);
  }

  if (!upstream.ok || !upstream.body) {
    const code = mapRemoveBgStatus(upstream.status);
    return jsonError(code, upstream.status >= 500 ? 502 : upstream.status);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, max-age=0",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
