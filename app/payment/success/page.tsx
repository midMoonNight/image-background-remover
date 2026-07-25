import Link from "next/link";

import { SparkleIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_15%,rgba(196,181,253,.4),transparent_30%),#f7f7fb]">
      <SiteHeader />
      <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8 sm:py-32">
        <span className="grid size-16 place-items-center rounded-3xl bg-emerald-100 text-emerald-700">
          <SparkleIcon className="size-8" />
        </span>
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Payment completed</p>
        <h1 className="mt-4 text-5xl font-extrabold text-slate-950 sm:text-6xl">Your monthly credits are ready.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          The purchased image allowance has been added to your account and is valid for 30 days.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/#tool" className="rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500">Process images</Link>
          <Link href="/pricing" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:border-slate-400">View balance</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
