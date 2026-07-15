"use client";

import Script from "next/script";
import { useCallback, useState } from "react";

type TurnstileGateProps = {
  children: (getToken: () => Promise<string>, ready: boolean) => React.ReactNode;
};

export function TurnstileGate({ children }: TurnstileGateProps) {
  const [ready, setReady] = useState(false);

  const getToken = useCallback(async () => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const turnstile = window.turnstile;
    if (!siteKey || !turnstile) {
      throw new Error("Verification is still loading. Please try again.");
    }

    return new Promise<string>((resolve, reject) => {
      const container = document.createElement("div");
      container.className = "fixed left-0 top-0 -z-10 opacity-0";
      container.setAttribute("aria-hidden", "true");
      document.body.appendChild(container);

      let widgetId = "";
      const cleanup = () => {
        if (widgetId) turnstile.remove(widgetId);
        container.remove();
      };

      widgetId = turnstile.render(container, {
        sitekey: siteKey,
        size: "invisible",
        execution: "execute",
        appearance: "interaction-only",
        action: "remove_background",
        callback: (token) => {
          cleanup();
          resolve(token);
        },
        "error-callback": () => {
          cleanup();
          reject(new Error("Verification failed. Please try again."));
        },
        "expired-callback": () => {
          cleanup();
          reject(new Error("Verification expired. Please try again."));
        },
      });
      turnstile.execute(widgetId);
    });
  }, []);

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      {children(getToken, ready)}
    </>
  );
}
