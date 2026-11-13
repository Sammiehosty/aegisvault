import Image from "next/image";
import Link from "next/link";
import { EyeOff, Lock, ShieldCheck, UserCheck } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthShell({
  headline,
  sub,
  children,
}: {
  headline: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="bg-grid absolute inset-0" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-aegis/[0.08] blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-line bg-panel/60 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:grid-cols-[1fr_1.1fr]">
        {/* brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-abyss p-10 lg:flex">
          <Image
            src="/images/hero-vault.jpg"
            alt=""
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/60 to-abyss/30" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-aegis to-glow">
                <ShieldCheck className="h-5 w-5 text-[#04120c]" strokeWidth={2.4} />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Aegis<span className="text-aegis">Vault</span>
              </span>
            </Link>
          </div>
          <div className="relative">
            <p className="font-display text-[26px] font-bold leading-tight tracking-tight text-white">
              Your keys stay yours. <span className="text-gradient">Your security gets a team.</span>
            </p>
            <ul className="mt-6 space-y-3 text-[13px] text-mist">
              <li className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-aegis/25 bg-aegis/10 text-aegis">
                  <EyeOff className="h-3.5 w-3.5" />
                </span>
                We never collect seed phrases or private keys
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-aegis/25 bg-aegis/10 text-aegis">
                  <UserCheck className="h-3.5 w-3.5" />
                </span>
                Every connection reviewed by a human analyst
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-aegis/25 bg-aegis/10 text-aegis">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                Non-custodial — funds never touch our systems
              </li>
            </ul>
          </div>
        </div>

        {/* form panel */}
        <div className="glass noise p-8 sm:p-10">
          <Link href="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-aegis to-glow">
              <ShieldCheck className="h-5 w-5 text-[#04120c]" strokeWidth={2.4} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Aegis<span className="text-aegis">Vault</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[28px]">
            {headline}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-fog">{sub}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </main>
  );
}
