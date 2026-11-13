"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Home, RotateCcw, ShieldCheck } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4">
      <div className="bg-grid absolute inset-0" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[640px] -translate-x-1/2 rounded-full bg-aegis/[0.07] blur-[110px]" />
      <div className="glass noise relative max-w-md rounded-[28px] p-10 text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-aegis to-glow">
          <ShieldCheck className="h-7 w-7 text-[#04120c]" strokeWidth={2.4} />
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          A hiccup, not a breach.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-fog">
          Something glitched while loading this view — your account and assets were never touched.
          Retry, or head back to safety.
        </p>
        {error.digest && (
          <p className="mono mt-4 rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-[11px] text-fog/70">
            ref: {error.digest}
          </p>
        )}
        <div className="mt-7 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-aegis px-5 py-2.5 text-sm font-bold text-[#04120c] transition hover:bg-[#3cf5b4]"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-mist transition hover:border-aegis/40 hover:text-white"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    </main>
  );
}
