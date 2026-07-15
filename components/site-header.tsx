import Link from "next/link";

import { SparkleIcon } from "@/components/icons";

export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Link href="/" className="flex items-center gap-2.5 text-slate-950">
        <span className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white">
          <SparkleIcon className="size-5" />
        </span>
        <span className="font-[family-name:var(--font-heading)] text-lg font-extrabold tracking-tight">Clearcut</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm font-semibold text-slate-600 sm:gap-7" aria-label="Main navigation">
        <a href="#how-it-works" className="hidden hover:text-slate-950 sm:block">How it works</a>
        <Link href="/privacy" className="hover:text-slate-950">Privacy</Link>
        <a href="#tool" className="rounded-full bg-slate-950 px-4 py-2 text-white hover:bg-slate-800">Try it free</a>
      </nav>
    </header>
  );
}
