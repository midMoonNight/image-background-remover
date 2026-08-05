import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type SeoLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  platform: string;
  guidance: string[];
  whiteBackground: string;
  transparentBackground: string;
  batchNote: string;
};

export function SeoLandingPage({
  eyebrow,
  title,
  description,
  platform,
  guidance,
  whiteBackground,
  transparentBackground,
  batchNote,
}: SeoLandingPageProps) {
  return (
    <main className="min-h-screen bg-[#f7f7fb]">
      <div className="bg-[radial-gradient(circle_at_80%_0%,rgba(196,181,253,.42),transparent_30%),linear-gradient(180deg,#fff_0%,#f7f7fb_100%)]">
        <SiteHeader />
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-12 text-center sm:px-8 sm:pb-24 sm:pt-20">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">{eyebrow}</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] text-slate-950 sm:text-6xl">{title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/#tool" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800">Try the background remover</Link>
            <Link href="/pricing" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 hover:border-slate-400">View image credit packs</Link>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">Background choice</p>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">Use the background that fits the listing.</h2>
            <p className="mt-4 leading-7 text-slate-600">These examples show how the same product can be prepared for a listing workflow. Always review the current requirements for your product category before publishing.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid aspect-square place-items-center rounded-2xl border border-slate-200 bg-white p-8">
                <div className="relative size-32 rounded-[2rem] bg-violet-600 shadow-[0_18px_25px_rgba(124,58,237,.25)]"><span className="absolute left-6 top-6 size-6 rounded-full bg-violet-300" /><span className="absolute bottom-7 right-6 size-10 rounded-xl bg-white/90" /></div>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-950">White background</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{whiteBackground}</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="checkerboard grid aspect-square place-items-center rounded-2xl border border-slate-200 p-8">
                <div className="relative size-32 rounded-[2rem] bg-violet-600 shadow-[0_18px_25px_rgba(124,58,237,.25)]"><span className="absolute left-6 top-6 size-6 rounded-full bg-violet-300" /><span className="absolute bottom-7 right-6 size-10 rounded-xl bg-white/90" /></div>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-950">Transparent background</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{transparentBackground}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white noise-grid">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300">A simple workflow</p>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Prepare {platform} photos in three steps.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Add your product photos", "Upload up to 20 JPG, PNG, or WebP images. Files remain in the active browser session."],
              ["02", "Remove and standardize", "Choose white or transparent output, then apply a marketplace canvas preset when it fits your workflow."],
              ["03", "Review and export", "Check each edge, download individual PNGs or a client-generated ZIP, and publish only when the result looks right."],
            ].map(([number, stepTitle, text]) => (
              <article key={number} className="rounded-3xl border border-white/10 bg-white/[0.06] p-7">
                <span className="text-sm font-extrabold text-violet-300">{number}</span>
                <h3 className="mt-8 text-xl font-bold">{stepTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">Listing guidance</p>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-950">What to check before you publish.</h2>
            <ul className="mt-7 space-y-4">
              {guidance.map((item) => <li key={item} className="flex gap-3 text-slate-600"><span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">✓</span><span className="leading-6">{item}</span></li>)}
            </ul>
          </div>
          <aside className="rounded-[2rem] border border-violet-100 bg-violet-50 p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">Batch note</p>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-950">Consistency matters more than one perfect image.</h2>
            <p className="mt-4 leading-7 text-slate-600">{batchNote}</p>
            <Link href="/#tool" className="mt-7 inline-block rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500">Start a batch</Link>
          </aside>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">Know the limits</p>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-950">Review difficult edges before listing.</h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">Fine hair, fur, glass, smoke, netting, shadows, and low-contrast products can need manual editing. ListingCut is designed to speed up a repeatable workflow, not to promise that every cutout is perfect.</p>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to prepare your product photos?</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">Start with two free image credits. No subscription and no persistent product-image storage.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/#tool" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 hover:bg-slate-100">Try it free</Link><Link href="/pricing" className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">See pricing</Link></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
