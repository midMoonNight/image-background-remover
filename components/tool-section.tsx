"use client";

import { BackgroundRemover } from "@/components/background-remover";
import { TurnstileGate } from "@/components/turnstile-gate";

export function ToolSection() {
  return (
    <TurnstileGate>
      {(getToken, ready) => (
        <BackgroundRemover getTurnstileToken={getToken} turnstileReady={ready} />
      )}
    </TurnstileGate>
  );
}
