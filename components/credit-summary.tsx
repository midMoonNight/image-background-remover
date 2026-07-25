"use client";

import { useEffect, useState } from "react";

type CreditBreakdown = {
  total: number;
  paid: number;
  free: number;
};

export function CreditSummary({ refreshKey }: { refreshKey: number }) {
  const [credits, setCredits] = useState<CreditBreakdown | null>(null);

  useEffect(() => {
    let active = true;

    const loadCredits = () => {
      fetch("/api/auth/session", { cache: "no-store" })
        .then((response) => response.json())
        .then((result: { user?: unknown; creditBreakdown?: CreditBreakdown }) => {
          if (active) setCredits(result.user ? (result.creditBreakdown ?? null) : null);
        })
        .catch(() => {
          if (active) setCredits(null);
        });
    };

    loadCredits();
    window.addEventListener("focus", loadCredits);
    window.addEventListener("auth-changed", loadCredits);
    return () => {
      active = false;
      window.removeEventListener("focus", loadCredits);
      window.removeEventListener("auth-changed", loadCredits);
    };
  }, [refreshKey]);

  if (!credits) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-4 sm:px-8">
      <div className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-xl font-extrabold text-emerald-600">$</span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Available credits</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">One successful background removal uses one credit.</p>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-2 sm:gap-3">
          {([
            ["Total", credits.total],
            ["Paid", credits.paid],
            ["Free", credits.free],
          ] as const).map(([label, value]) => (
            <div key={label} className="min-w-20 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center sm:min-w-28">
              <dd className="text-2xl font-extrabold text-slate-950">{value}</dd>
              <dt className="mt-1 text-xs font-semibold text-slate-500">{label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
