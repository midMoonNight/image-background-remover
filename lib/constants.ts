export const MAX_FILES = 20;
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type BackgroundMode = "white" | "transparent";
export type SizePreset = "original" | "amazon" | "etsy" | "shopify";

export const SIZE_PRESETS: Record<
  SizePreset,
  { label: string; description: string; width: number | null; height: number | null }
> = {
  original: {
    label: "Original",
    description: "Keep the Remove.bg output size",
    width: null,
    height: null,
  },
  amazon: {
    label: "Amazon",
    description: "2000 × 2000 px",
    width: 2000,
    height: 2000,
  },
  etsy: {
    label: "Etsy",
    description: "2000 × 2000 px",
    width: 2000,
    height: 2000,
  },
  shopify: {
    label: "Shopify",
    description: "2048 × 2048 px",
    width: 2048,
    height: 2048,
  },
};

export const APP_ERROR_MESSAGES = {
  INVALID_FILE: "Choose a valid JPG, PNG, or WebP image.",
  FILE_TOO_LARGE: "This image is too large. Compress it and try again.",
  TOO_MANY_FILES: `You can process up to ${MAX_FILES} images at a time.`,
  VERIFICATION_FAILED: "Verification expired or failed. Please try again.",
  AUTH_REQUIRED: "Sign in to process images.",
  INSUFFICIENT_CREDITS: "You are out of active image credits. Choose a pack to continue.",
  UPSTREAM_REJECTED: "Remove.bg could not isolate this subject. Try a clearer product photo.",
  UPSTREAM_QUOTA_EXCEEDED: "The service has reached its processing limit. Please try again later.",
  UPSTREAM_RATE_LIMITED: "The service is busy. Wait a moment and retry this image.",
  UPSTREAM_UNAVAILABLE: "Remove.bg is temporarily unavailable. Retry this image shortly.",
  PROCESSING_FAILED: "We could not process this image. Please retry.",
} as const;

export type AppErrorCode = keyof typeof APP_ERROR_MESSAGES;
