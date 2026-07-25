"use client";

import { useEffect, useState } from "react";

type User = {
  email: string;
  name: string;
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.7 4.7 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.7A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.3L6.5 14Z" />
      <path fill="#EA4335" d="M12 6a5.4 5.4 0 0 1 3.8 1.5l2.9-2.8A9.8 9.8 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 6Z" />
    </svg>
  );
}

export function AuthControls() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { user?: User | null }) => setUser(result.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (response.ok) {
      setUser(null);
      window.dispatchEvent(new Event("auth-changed"));
    }
  }

  if (loading) return <span className="hidden h-9 w-24 animate-pulse rounded-full bg-slate-200 sm:block" />;

  if (!user) {
    return (
      <a
        href="/api/auth/google"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-950"
      >
        <GoogleIcon />
        <span className="hidden sm:inline">Sign in</span>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-36 truncate text-slate-600 sm:block" title={user.email}>
        {user.name}
      </span>
      <button
        type="button"
        onClick={logout}
        className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-950"
      >
        Sign out
      </button>
    </div>
  );
}
