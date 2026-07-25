"use client";

import { useCallback, useState } from "react";

import { BackgroundRemover } from "@/components/background-remover";
import { CreditSummary } from "@/components/credit-summary";
import { TurnstileGate } from "@/components/turnstile-gate";

export function ToolSection() {
  const [creditRefreshKey, setCreditRefreshKey] = useState(0);
  const refreshCredits = useCallback(() => setCreditRefreshKey((key) => key + 1), []);

  return (
    <TurnstileGate>
      {(getToken, ready) => (
        <>
          <CreditSummary refreshKey={creditRefreshKey} />
          <BackgroundRemover
            getTurnstileToken={getToken}
            turnstileReady={ready}
            onCreditUsed={refreshCredits}
          />
        </>
      )}
    </TurnstileGate>
  );
}
