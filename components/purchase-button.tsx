"use client";

import { useState } from "react";

type PurchaseButtonProps = {
  planId: string;
  featured?: boolean;
  children: React.ReactNode;
};

export function PurchaseButton({ planId, featured = false, children }: PurchaseButtonProps) {
  const [loading, setLoading] = useState<"paypal" | "creem" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function purchase(provider: "paypal" | "creem") {
    setLoading(provider);
    setMessage(null);
    try {
      const response = await fetch(provider === "paypal" ? "/api/paypal/create-order" : "/api/creem/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (response.status === 401) {
        window.location.href = `/api/auth/google?returnTo=${encodeURIComponent("/pricing")}`;
        return;
      }
      const result = (await response.json()) as { approvalUrl?: string; checkoutUrl?: string; message?: string };
      const checkoutUrl = provider === "paypal" ? result.approvalUrl : result.checkoutUrl;
      if (!response.ok || !checkoutUrl) throw new Error(result.message || "Checkout failed.");
      window.location.href = checkoutUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout failed.");
      setLoading(null);
    }
  }

  return (
    <div className="mt-7 space-y-2">
      <button
        type="button"
        onClick={() => purchase("paypal")}
        disabled={loading !== null}
        className={`w-full rounded-full px-5 py-3 text-center text-sm font-bold transition disabled:cursor-wait disabled:opacity-70 ${
          featured ? "bg-violet-600 text-white hover:bg-violet-500" : "bg-slate-950 text-white hover:bg-slate-800"
        }`}
      >
        {loading === "paypal" ? "Opening PayPal..." : `${children} with PayPal`}
      </button>
      <button
        type="button"
        onClick={() => purchase("creem")}
        disabled={loading !== null}
        className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-center text-sm font-bold text-slate-800 transition hover:border-violet-400 hover:text-violet-700 disabled:cursor-wait disabled:opacity-70"
      >
        {loading === "creem" ? "Opening Creem..." : `${children} with Creem`}
      </button>
      {message && <p className="mt-2 text-center text-xs text-rose-600">{message}</p>}
    </div>
  );
}
