import { describe, expect, it } from "vitest";

import { isAllowedOrigin, mapRemoveBgStatus } from "@/lib/server/remove-bg";

describe("isAllowedOrigin", () => {
  const allowedOrigins = "https://listingcut.shop, https://www.listingcut.shop";

  it.each(["https://listingcut.shop", "https://www.listingcut.shop"])(
    "allows %s",
    (origin) => {
      expect(isAllowedOrigin(origin, allowedOrigins)).toBe(true);
    },
  );

  it("rejects an unlisted origin", () => {
    expect(isAllowedOrigin("https://example.com", allowedOrigins)).toBe(false);
  });
});

describe("mapRemoveBgStatus", () => {
  it.each([
    [400, "UPSTREAM_REJECTED"],
    [402, "UPSTREAM_QUOTA_EXCEEDED"],
    [429, "UPSTREAM_RATE_LIMITED"],
    [500, "UPSTREAM_UNAVAILABLE"],
    [503, "UPSTREAM_UNAVAILABLE"],
  ] as const)("maps %s to %s", (status, expected) => {
    expect(mapRemoveBgStatus(status)).toBe(expected);
  });
});
