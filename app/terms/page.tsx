import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">Terms</p>
        <h1 className="mt-4 text-4xl font-extrabold text-slate-950 sm:text-5xl">Terms of use</h1>
        <div className="mt-10 space-y-8 text-base leading-7 text-slate-600">
          <section><h2 className="text-xl font-bold text-slate-950">Your content</h2><p className="mt-2">Only upload images that you own or are authorized to process. Do not upload unlawful, abusive, or privacy-infringing content.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Prohibited content</h2><p className="mt-2">You may not upload or process images containing adult, NSFW, pornographic, sexual, sexually explicit, exploitative, or otherwise illegal content. We reserve the right to reject processing or suspend access when this policy is violated.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Automated results</h2><p className="mt-2">Background removal is automated and may be inaccurate, especially around hair, fur, glass, netting, smoke, shadows, or low-contrast subjects. Review every image before publishing it.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Marketplace compliance</h2><p className="mt-2">Canvas presets are workflow aids, not a guarantee that Amazon, Etsy, Shopify, or another marketplace will approve or rank an image.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Availability</h2><p className="mt-2">The service depends on Cloudflare and Remove.bg. It may be rate-limited, paused, or unavailable, and unsaved results cannot be recovered after the page closes.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">One-time credit packs</h2><p className="mt-2">Paid packs are one-time purchases, not subscriptions, and do not renew automatically. Each purchased allowance expires 30 days after payment. One credit is used only after a successful background-removal response; failed processing requests do not consume a credit.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Fair use</h2><p className="mt-2">Do not bypass verification, automate abusive request volumes, resell access without permission, or attempt to discover service credentials.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Support</h2><p className="mt-2">For account, payment, refund, or product support, contact <a href="mailto:support@listingcut.shop" className="font-semibold text-violet-700 hover:text-violet-900">support@listingcut.shop</a>.</p></section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
