import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ShieldIcon, SparkleIcon } from "@/components/icons";
import { PricingStatus } from "@/components/pricing-status";
import { PurchaseButton } from "@/components/purchase-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Pricing | ListingCut Background Remover",
  description: "Simple image credit packs for product background removal. No subscription required.",
};

const plans = [
  { name: "Free Trial", price: "$0", credits: "2 images", unitPrice: "One-time welcome credit", description: "See the full workflow before you buy.", audience: "New users", cta: "Start free", featured: false, features: ["Full-quality PNG output", "White or transparent background", "Marketplace canvas presets"] },
  { id: "starter", name: "Starter", price: "$5.99", credits: "10 images", unitPrice: "$0.60 per image", description: "A small pack for occasional product listings.", audience: "Casual sellers", cta: "Choose Starter", featured: false, features: ["Everything in Free Trial", "Credits valid for 30 days", "Individual and ZIP downloads"] },
  { id: "seller", name: "Seller", price: "$19.99", credits: "40 images", unitPrice: "$0.50 per image", description: "The practical choice for an active online store.", audience: "Regular sellers", cta: "Choose Seller", featured: true, features: ["Everything in Starter", "Process batches of up to 20", "Best balance of price and volume"] },
  { id: "business", name: "Business", price: "$39.99", credits: "100 images", unitPrice: "$0.40 per image", description: "More room for studios and growing catalogs.", audience: "Teams and studios", cta: "Choose Business", featured: false, features: ["Everything in Seller", "Lowest price per image", "Built for larger product catalogs"] },
] as const;

const commonFeatures = [
  "Batch upload up to 20 images",
  "Automatic background removal",
  "White or transparent output",
  "Amazon, Etsy, and Shopify presets",
  "Individual PNG and batch ZIP downloads",
  "No persistent product image storage",
];

const faqs = [
  { question: "Do credits expire?", answer: "Each one-time purchase provides a monthly image allowance valid for 30 days. Free Trial credits are granted once per Google account and are also valid for 30 days." },
  { question: "When is a credit charged?", answer: "One credit is charged only after the background-removal service returns a successful result. Failed requests and network errors do not consume a credit." },
  { question: "Do background and size changes use more credits?", answer: "No. Switching between white and transparent backgrounds or changing marketplace canvas presets happens in your browser and does not spend another credit." },
  { question: "Is this a subscription?", answer: "No. These are one-time credit packs with no automatic renewal. We may introduce optional subscriptions later for high-volume users." },
  { question: "Are my product images stored?", answer: "No persistent copy or image history is kept by ListingCut. Images are processed for the active request, while previews and ZIP files are created in your browser." },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#f7f7fb]">
      <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(196,181,253,.42),transparent_34%),linear-gradient(180deg,#fff_0%,#f7f7fb_100%)]">
        <SiteHeader />
        <section className="mx-auto max-w-4xl px-5 pb-14 pt-14 text-center sm:px-8 sm:pb-20 sm:pt-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-700 shadow-sm">
            <SparkleIcon className="size-4" /> Pay once, use when needed
          </div>
          <h1 className="mt-7 text-5xl font-extrabold leading-[1.02] text-slate-950 sm:text-6xl">
            Clear pricing for<br /><span className="text-violet-600">clean product photos.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Buy an image credit pack without a subscription. Every plan includes the complete background-removal workflow and marketplace-ready exports.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
            <span>No automatic renewal</span><span>30-day monthly allowance</span><span>Failed jobs cost 0 credits</span>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <Suspense fallback={null}>
          <PricingStatus />
        </Suspense>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative flex min-h-full flex-col rounded-[2rem] border bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,.07)] ${plan.featured ? "border-violet-500 ring-4 ring-violet-100" : "border-slate-200"}`}>
              {plan.featured && <span className="absolute -top-3 right-6 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">Most popular</span>}
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-bold uppercase tracking-[0.15em] text-violet-700">{plan.audience}</p><h2 className="mt-2 text-2xl font-extrabold text-slate-950">{plan.name}</h2></div>
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-600"><SparkleIcon className="size-5" /></span>
              </div>
              <p className="mt-5 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
              <div className="mt-7">
                <div className="flex items-end gap-2"><span className="text-4xl font-extrabold tracking-tight text-slate-950">{plan.price}</span>{plan.price !== "$0" && <span className="pb-1 text-sm text-slate-500">one time</span>}</div>
                <p className="mt-2 text-lg font-bold text-slate-900">{plan.credits}</p><p className="mt-1 text-sm text-slate-500">{plan.unitPrice}</p>
              </div>
              {"id" in plan ? (
                <PurchaseButton planId={plan.id} featured={plan.featured}>{plan.cta}</PurchaseButton>
              ) : (
                <Link href="/api/auth/google?returnTo=%2Fpricing" className="mt-7 rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800">{plan.cta}</Link>
              )}
              <div className="my-7 h-px bg-slate-200" />
              <ul className="space-y-3 text-sm leading-5 text-slate-600">
                {plan.features.map((feature) => <li key={feature} className="flex gap-3"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">✓</span>{feature}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">Secure one-time checkout via PayPal or Creem. Credits are added after payment confirmation.</p>
      </section>

      <section className="bg-slate-950 py-20 text-white noise-grid">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:px-10">
          <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300">Included everywhere</p><h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">Features stay simple. Only volume changes.</h2><p className="mt-5 max-w-xl leading-7 text-slate-400">We do not hide better output quality behind a more expensive tier. Choose the pack that matches your catalog size.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">{commonFeatures.map((feature) => <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4"><ShieldIcon className="size-5 shrink-0 text-violet-300" /><span className="text-sm font-semibold text-slate-200">{feature}</span></div>)}</div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">Credit rules</p><h2 className="mt-3 text-4xl font-extrabold text-slate-950">You pay for successful cutouts, not clicks.</h2></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[["01", "Successful result", "One successful Remove.bg result uses one image credit."], ["02", "Failure protection", "Service errors and failed network requests use no credits."], ["03", "Free reformatting", "Background, canvas, download, and ZIP changes use no extra credits."]].map(([number, title, text]) => <article key={number} className="rounded-3xl border border-slate-200 bg-slate-50 p-6"><span className="text-sm font-extrabold text-violet-600">{number}</span><h3 className="mt-6 text-xl font-bold text-slate-950">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-violet-50 py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">FAQ</p><h2 className="mt-3 text-4xl font-extrabold text-slate-950">Before you choose a pack.</h2></div>
          <div className="mt-10 space-y-4">{faqs.map((faq) => <details key={faq.question} className="group rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-950">{faq.question}<span className="text-xl text-violet-600 transition group-open:rotate-45">+</span></summary><p className="mt-3 pr-8 text-sm leading-6 text-slate-600">{faq.answer}</p></details>)}</div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-[2.25rem] bg-violet-600 px-6 py-12 text-center text-white shadow-[0_24px_80px_rgba(124,58,237,.28)] sm:px-12">
          <SparkleIcon className="mx-auto size-8 text-violet-200" /><h2 className="mt-5 text-4xl font-extrabold">Start with two images on us.</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-violet-100">Sign in with Google to prepare your account. No subscription and no card required for the Free Trial.</p><Link href="/api/auth/google" className="mt-7 inline-block rounded-full bg-white px-7 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50">Sign in to start free</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
