import { describe, expect, it } from "vitest";

import {
  allowedRequestOrigin,
  createPkceChallenge,
  googleAuthorizationUrl,
  randomToken,
  safeReturnPath,
  sha256,
} from "@/lib/server/auth";

describe("Google OAuth helpers", () => {
  it("only allows configured production origins", () => {
    const allowed = "https://listingcut.shop,https://www.listingcut.shop";
    expect(allowedRequestOrigin("https://listingcut.shop", allowed)).toBe(true);
    expect(allowedRequestOrigin("https://www.listingcut.shop", allowed)).toBe(true);
    expect(allowedRequestOrigin("https://example.com", allowed)).toBe(false);
  });

  it("creates an authorization URL with the custom callback", async () => {
    const url = new URL(
      googleAuthorizationUrl({
        clientId: "client-id",
        redirectUri: "https://listingcut.shop/api/auth/google/callback",
        state: "state",
        codeChallenge: await createPkceChallenge("verifier"),
      }),
    );

    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://listingcut.shop/api/auth/google/callback",
    );
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  });

  it("creates URL-safe random tokens and stable hashes", async () => {
    expect(randomToken()).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(await sha256("value")).toBe(await sha256("value"));
    expect(await sha256("value")).not.toBe(await sha256("other"));
  });
});

describe("safeReturnPath", () => {
  it("allows local application paths", () => {
    expect(safeReturnPath("/pricing?payment=cancelled")).toBe("/pricing?payment=cancelled");
  });

  it.each([null, "https://example.com", "//example.com", "/\\example.com", "pricing"])(
    "rejects unsafe return value %s",
    (value) => {
      expect(safeReturnPath(value)).toBe("/");
    },
  );
});
