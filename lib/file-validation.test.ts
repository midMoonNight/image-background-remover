import { describe, expect, it } from "vitest";

import { hasValidImageSignature, validateFile, validateFileCount } from "@/lib/file-validation";

describe("validateFile", () => {
  it("accepts a supported image within the size limit", () => {
    expect(validateFile({ name: "shoe.png", size: 1024, type: "image/png" })).toEqual({ ok: true });
  });

  it("rejects an unsupported MIME type", () => {
    expect(validateFile({ name: "notes.txt", size: 1024, type: "text/plain" })).toMatchObject({
      ok: false,
      code: "INVALID_FILE",
    });
  });

  it("rejects a file over the configured limit", () => {
    expect(validateFile({ name: "large.jpg", size: 11, type: "image/jpeg" }, 10)).toMatchObject({
      ok: false,
      code: "FILE_TOO_LARGE",
    });
  });
});

describe("validateFileCount", () => {
  it("allows a batch up to 20 images", () => {
    expect(validateFileCount(12, 8)).toEqual({ ok: true });
  });

  it("rejects a batch over 20 images", () => {
    expect(validateFileCount(20, 1)).toMatchObject({ ok: false, code: "TOO_MANY_FILES" });
  });
});

describe("hasValidImageSignature", () => {
  it("recognizes PNG bytes", async () => {
    const blob = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], {
      type: "image/png",
    });
    expect(await hasValidImageSignature(blob)).toBe(true);
  });

  it("rejects a spoofed PNG MIME type", async () => {
    const blob = new Blob(["not an image"], { type: "image/png" });
    expect(await hasValidImageSignature(blob)).toBe(false);
  });
});
