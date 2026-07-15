import { describe, expect, it } from "vitest";

import { mapRemoveBgStatus } from "@/lib/server/remove-bg";

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
