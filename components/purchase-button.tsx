"use client";

import { useState } from "react";

type PurchaseButtonProps = {
  planId: string;
  featured?: boolean;
  children: React.ReactNode;
};

export function PurchaseButton({ planId, featured = false, children }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function purchase() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (response.status === 401) {
        window.location.href = `/api/auth/google?returnTo=${encodeURIComponent("/pricing")}`;
        return;
      }
      const result = (await response.json()) as { approvalUrl?: string; message?: string };
      if (!response.ok || !result.approvalUrl) throw new Error(result.message || "Checkout failed.");
      window.location.href = result.approvalUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-7">
      <button
        type="button"
        onClick={purchase}
        disabled={loading}
        className={`w-full rounded-full px-5 py-3 text-center text-sm font-bold transition disabled:cursor-wait disabled:opacity-70 ${
          featured ? "bg-violet-600 text-white hover:bg-violet-500" : "bg-slate-950 text-white hover:bg-slate-800"
        }`}
      >
        {loading ? "Opening PayPal..." : children}
      </button>
      {message && <p className="mt-2 text-center text-xs text-rose-600">{message}</p>}
    </div>
  );
}
