import {
  ACCEPTED_MIME_TYPES,
  APP_ERROR_MESSAGES,
  DEFAULT_MAX_FILE_SIZE,
  MAX_FILES,
  type AppErrorCode,
} from "@/lib/constants";

export type FileLike = {
  name: string;
  size: number;
  type: string;
};

export type FileValidationResult =
  | { ok: true }
  | { ok: false; code: AppErrorCode; message: string };

export function validateFile(
  file: FileLike,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
): FileValidationResult {
  if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
    return {
      ok: false,
      code: "INVALID_FILE",
      message: `${file.name}: ${APP_ERROR_MESSAGES.INVALID_FILE}`,
    };
  }

  if (file.size <= 0) {
    return {
      ok: false,
      code: "INVALID_FILE",
      message: `${file.name}: the file is empty or damaged.`,
    };
  }

  if (file.size > maxFileSize) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: `${file.name}: ${APP_ERROR_MESSAGES.FILE_TOO_LARGE}`,
    };
  }

  return { ok: true };
}

export function validateFileCount(existing: number, incoming: number): FileValidationResult {
  if (existing + incoming > MAX_FILES) {
    return {
      ok: false,
      code: "TOO_MANY_FILES",
      message: APP_ERROR_MESSAGES.TOO_MANY_FILES,
    };
  }

  return { ok: true };
}

export function fileFingerprint(file: FileLike & { lastModified?: number }): string {
  return [file.name, file.size, file.type, file.lastModified ?? 0].join(":");
}

export async function hasValidImageSignature(file: Blob & { type: string }): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (file.type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }

  if (file.type === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}
