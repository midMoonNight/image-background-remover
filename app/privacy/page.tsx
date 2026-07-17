import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">Privacy</p>
        <h1 className="mt-4 text-4xl font-extrabold text-slate-950 sm:text-5xl">How image processing works</h1>
        <div className="mt-10 space-y-8 text-base leading-7 text-slate-600">
          <section><h2 className="text-xl font-bold text-slate-950">No product image storage</h2><p className="mt-2">Original files and processed results exist only during the active request and your current browser session. They are not saved to the account database, object storage, KV, or an image history.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Account information</h2><p className="mt-2">If you sign in with Google, this site stores your Google account identifier, email address, display name, avatar URL, and a hashed session token in Cloudflare D1 so it can recognize your account. Google login is limited to basic profile, email, and identity permissions.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Third-party processing</h2><p className="mt-2">Your selected image is sent through a Cloudflare Worker to the Remove.bg API. Remove.bg processes the image under its own privacy policy and terms. The image therefore does leave your device; our promise is that this site does not retain a persistent copy.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Browser-only output work</h2><p className="mt-2">White backgrounds, canvas resizing, previews, and ZIP files are created in your browser. Refreshing or closing the page permanently removes those in-browser results.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Operational logs</h2><p className="mt-2">Infrastructure logs may contain request time, status, duration, and general error codes. They must not contain image contents, file names, API keys, or verification tokens.</p></section>
          <section><h2 className="text-xl font-bold text-slate-950">Analytics and feedback</h2><p className="mt-2">Anonymous page-level analytics may be used to understand whether the tool is useful. Images and file names are not sent through feedback links unless you explicitly choose to share them.</p></section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
