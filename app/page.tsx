import { ShieldIcon, SparkleIcon, UploadIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToolSection } from "@/components/tool-section";

export const metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="relative bg-[radial-gradient(circle_at_80%_15%,rgba(196,181,253,.45),transparent_28%),linear-gradient(180deg,#fff_0%,#f7f7fb_100%)]">
        <SiteHeader />
        <section className="relative mx-auto max-w-7xl px-5 pb-10 pt-10 text-center sm:px-8 sm:pt-14 lg:px-10 lg:pb-14">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700 shadow-sm">
            <SparkleIcon className="size-3.5" /> Product photos, ready to list
          </div>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-extrabold leading-[0.98] text-slate-950 sm:text-5xl lg:text-6xl">
            Clean backgrounds.<br /><span className="text-violet-600">Whole batches.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Remove distracting backgrounds, apply a consistent white canvas, and export listing-ready product images without storing your photos.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-500" /> Up to 20 images</span>
            <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-500" /> Client-side ZIP</span>
            <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-500" /> No image history</span>
          </div>
        </section>

        <ToolSection />
      </div>

      <section id="how-it-works" className="bg-slate-950 py-24 text-white noise-grid">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">Three quiet steps</p>
            <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">From camera roll to catalog.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: UploadIcon, number: "01", title: "Add a batch", text: "Drop up to 20 clear product photos. Files stay in the current browser session." },
              { icon: SparkleIcon, number: "02", title: "Remove and standardize", text: "Remove.bg isolates the subject, then your browser applies white or transparent platform presets." },
              { icon: ShieldIcon, number: "03", title: "Download and move on", text: "Download one PNG or a client-generated ZIP. This site does not keep a copy or history." },
            ].map((step) => (
              <article key={step.number} className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur">
                <div className="flex items-center justify-between">
                  <step.icon className="size-7 text-violet-300" />
                  <span className="text-sm font-bold text-slate-500">{step.number}</span>
                </div>
                <h3 className="mt-10 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-violet-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">Know the limits</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-950 sm:text-4xl">Best for clear, physical products.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Fine hair, fur, glass, smoke, netting, or subjects that blend into the background may need manual editing. We would rather say that clearly than promise a perfect cutout every time.
            </p>
          </div>
          <a href="https://github.com/midMoonNight/image-background-remover/issues/new?title=Product%20photo%20result%20feedback" className="rounded-full bg-violet-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-violet-500">
            Share feedback
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
