"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function PricingStatus() {
  const params = useSearchParams();
  const payment = params.get("payment");
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { user?: unknown; credits?: number }) => {
        if (result.user) setCredits(Number(result.credits ?? 0));
      })
      .catch(() => undefined);
  }, [payment]);

  return (
    <>
      {payment === "success" && <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm font-semibold text-emerald-800">Payment completed. Your monthly image credits are ready.</div>}
      {payment === "cancelled" && <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm font-semibold text-amber-800">Payment was cancelled. No charge was made.</div>}
      {payment === "error" && <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-center text-sm font-semibold text-rose-800">We could not confirm the payment. Please try again or contact support.</div>}
      {credits !== null && <p className="mb-6 text-center text-sm font-bold text-violet-700">Active image credits: {credits}</p>}
    </>
  );
}
