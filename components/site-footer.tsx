import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>© 2026 Clearcut. Built for fast product-photo workflows.</p>
        <nav className="flex gap-5" aria-label="Footer navigation">
          <Link href="/pricing" className="hover:text-slate-950">Pricing</Link>
          <Link href="/privacy" className="hover:text-slate-950">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-950">Terms</Link>
          <a href="https://github.com/midMoonNight/image-background-remover/issues/new" className="hover:text-slate-950">Feedback</a>
        </nav>
      </div>
    </footer>
  );
}
