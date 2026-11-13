"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Ban,
  BookOpenCheck,
  Bug,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Coins,
  Copy,
  EyeOff,
  FileWarning,
  Flame,
  Gift,
  Globe,
  KeyRound,
  Landmark,
  Lock,
  Radar,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Sparkles,
  UserCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.85, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-aegis to-glow shadow-[0_8px_28px_-8px_rgba(23,232,160,0.6)]">
        <ShieldCheck className="h-5 w-5 text-[#04120c]" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-white">
          Aegis<span className="text-aegis">Vault</span>
        </span>
      )}
    </span>
  );
}

/* ----------------------------------- nav ---------------------------------- */

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="AegisVault home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-[13.5px] font-medium text-fog md:flex">
          <a href="#threats" className="transition hover:text-white">Threat library</a>
          <a href="#how" className="transition hover:text-white">How it works</a>
          <a href="#rules" className="transition hover:text-white">Golden rules</a>
          <a href="#review" className="transition hover:text-white">Human review</a>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-[13.5px] font-semibold text-fog transition hover:text-white sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="group inline-flex items-center gap-1.5 rounded-xl bg-aegis px-4 py-2 text-[13.5px] font-bold text-[#04120c] shadow-[0_8px_30px_-8px_rgba(23,232,160,0.6)] transition hover:bg-[#3cf5b4]"
          >
            Get protected
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------- hero --------------------------------- */

const MARQUEE_ITEMS = [
  "Seed-phrase phishing",
  "Flash USDT & balance spoofing",
  "Address poisoning",
  "Fake giveaways",
  "Drainer approvals",
  "Impersonation support",
  "Honeypot tokens",
  "SIM-swap takeovers",
];

function Hero() {
  return (
    <section className="relative overflow-hidden pt-[68px]">
      <div className="bg-grid absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-aegis/[0.09] blur-[130px]" />
      <div className="pointer-events-none absolute right-[-160px] top-40 h-[420px] w-[420px] rounded-full bg-glow/[0.07] blur-[110px]" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="inline-flex items-center gap-1.5 rounded-full border border-aegis/25 bg-aegis/[0.07] py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-aegis"
          >
            <span className="flex items-center gap-1 rounded-full bg-aegis px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#04120c]">
              <Sparkles className="h-3 w-3" /> New
            </span>
            Human-reviewed wallet protection is live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease }}
            className="mt-6 font-display text-[44px] font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl lg:text-[68px]"
          >
            Secure your crypto.
            <br />
            <span className="text-gradient">Outsmart the scammers.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.16, ease }}
            className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-fog sm:text-base"
          >
            AegisVault hardens your wallets against phishing, flash-balance fraud and
            seed-phrase theft — with compliance-reviewed wallet protection and guided
            backup verification. We hold nothing, we custody nothing, and we{" "}
            <span className="font-semibold text-white">never ask for your recovery phrase. Ever.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.24, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-aegis px-6 py-3.5 text-sm font-bold text-[#04120c] shadow-[0_14px_44px_-10px_rgba(23,232,160,0.65)] transition hover:bg-[#3cf5b4]"
            >
              Create secure account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-mist transition hover:border-aegis/40 hover:text-white"
            >
              <BookOpenCheck className="h-4 w-4 text-aegis" />
              How protection works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-fog"
          >
            {["Zero custody", "Public addresses only", "Median review under 24h", "Seed phrases never collected"].map(
              (t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-aegis" />
                  {t}
                </span>
              ),
            )}
          </motion.div>
        </div>

        {/* hero visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease }}
          className="relative"
        >
          <div className="glass noise relative overflow-hidden rounded-[28px] p-2 ring-glow">
            <div className="relative overflow-hidden rounded-[20px]">
              <Image
                src="/images/hero-vault.jpg"
                alt="AegisVault digital vault shield"
                width={880}
                height={880}
                className="h-auto w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            </div>

            <motion.div
              className="glass absolute left-5 top-5 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 animate-float-slow"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-aegis/15 text-aegis">
                <Wallet className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-white">MetaMask · Connected</p>
                <p className="mono text-[10px] text-aegis">0x8fE2…3D2a · EVM</p>
              </div>
              <BadgeCheck className="ml-1 h-4 w-4 text-aegis" />
            </motion.div>

            <motion.div
              className="glass absolute bottom-16 right-5 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5"
              style={{ animation: "floatSlow 9s ease-in-out 1.4s infinite" }}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-danger/15 text-danger">
                <ShieldX className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-white">Flash-balance scam flagged</p>
                <p className="text-[10px] text-fog">Fake USDT credit · blocked</p>
              </div>
            </motion.div>

            <motion.div
              className="glass absolute bottom-5 left-5 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5"
              style={{ animation: "floatSlow 10s ease-in-out 0.7s infinite" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8, ease }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-glow/15 text-glow">
                <Lock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-white">Backup verified</p>
                <p className="text-[10px] text-fog">Steel plate · 2 locations · 6/6</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* threat marquee */}
      <div className="relative border-y border-line/70 bg-abyss/80 py-3.5">
        <div className="flex overflow-hidden" aria-hidden>
          <div className="flex shrink-0 items-center gap-10 pr-10 animate-marquee">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-10 whitespace-nowrap font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-fog/70"
              >
                {item}
                <ShieldAlert className="h-3.5 w-3.5 text-danger/70" />
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-10 pr-10 animate-marquee">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={`b-${i}`}
                className="flex items-center gap-10 whitespace-nowrap font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-fog/70"
              >
                {item}
                <ShieldAlert className="h-3.5 w-3.5 text-danger/70" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- stats ----------------------------------- */

const STATS: Array<[string, string, ReactNode]> = [
  ["38,400+", "wallets under protection review", <Wallet key="i" className="h-4 w-4" />],
  ["$214M", "in scam attempts flagged & blocked", <Ban key="i" className="h-4 w-4" />],
  ["< 24 hrs", "median human compliance review", <UserCheck key="i" className="h-4 w-4" />],
  ["0", "seed phrases requested — ever", <EyeOff key="i" className="h-4 w-4" />],
];

function Stats() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(([value, label, icon], i) => (
          <Reveal key={label} delay={i * 0.07}>
            <div className="glass card-hover rounded-2xl p-6">
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white/[0.03] text-aegis">
                {icon}
              </div>
              <p className="font-display text-3xl font-bold tracking-tight text-white">{value}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-fog">{label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- threat cards ------------------------------ */

const THREATS = [
  {
    icon: FileWarning,
    title: "Fake “wallet validation” sites",
    body: "Cloned security portals claim your wallet must be “synchronized” or “validated” and ask you to type your 12/24-word recovery phrase. The moment you do, the wallet is drained. AegisVault screens payment addresses before you ever send funds.",
  },
  {
    icon: Coins,
    title: "Flash USDT & balance spoofing",
    body: "“Wallet flashing” tools display fake balances or testnet tokens that look spendable — until the victim pays a “release fee”. Learn how to confirm real on-chain balances and never pay to unlock phantom funds.",
  },
  {
    icon: KeyRound,
    title: "Seed-phrase harvesting",
    body: "Fake support agents, airdrop forms and browser popups beg for your recovery words. There is no legitimate reason — none — to type them into a website. Our checklist training makes this reflex automatic.",
  },
  {
    icon: Gift,
    title: "Giveaway & doubling scams",
    body: "“Send 1 BTC, receive 2 back” livestreams and celebrity deepfakes. Our payment-screening references known scam-address datasets before you commit funds.",
  },
  {
    icon: Copy,
    title: "Address poisoning",
    body: "Scammers seed your history with lookalike addresses matching the first and last characters of addresses you use. Always verify the full string — we teach a 6-second verification habit.",
  },
  {
    icon: Bug,
    title: "Drainer approvals & honeypots",
    body: "One malicious “Sign” can grant unlimited token allowances. We walk you through reviewing and revoking stale approvals, and spotting tokens that can be bought but never sold.",
  },
];

function Threats() {
  return (
    <section id="threats" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <Reveal>
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-danger/25 bg-danger/[0.07] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-danger">
            <Radar className="h-3.5 w-3.5" /> Threat library
          </p>
          <h2 className="font-display text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
            Know the scam before <span className="text-gradient">it knows you.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-fog">
            Most crypto losses are not hacks — they are conversations. AegisVault trains you to
            recognise the six attack patterns behind nearly every drained wallet, then adds a
            human-reviewed protection layer on top.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {THREATS.map((t, i) => (
          <Reveal key={t.title} delay={(i % 3) * 0.08}>
            <div className="glass card-hover group flex h-full flex-col rounded-2xl p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-danger/20 bg-danger/[0.08] text-danger transition-colors duration-300 group-hover:border-aegis/30 group-hover:bg-aegis/10 group-hover:text-aegis">
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-[17px] font-semibold tracking-tight text-white">{t.title}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-fog">{t.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- how it works ----------------------------- */

const STEPS = [
  {
    icon: UserCheck,
    step: "01",
    title: "Create your secure account",
    body: "Register in under a minute. Your dashboard tracks a live Security Score across wallet protection, backup health and scam-awareness training.",
  },
  {
    icon: Wallet,
    step: "02",
    title: "Connect a wallet — safely",
    body: "Choose your wallet type and submit only your PUBLIC address — the same string you’d share to receive a payment. It is screened against fraud datasets and queued for review. We never request seed phrases, keys or signatures that move funds.",
  },
  {
    icon: ClipboardCheck,
    step: "03",
    title: "Human compliance review",
    body: "Every connection and backup verification goes from Pending to Connected only after a trained reviewer approves it. You watch the status change in real time from your dashboard.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="relative border-y border-line/60 bg-abyss/60 py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-aegis/25 bg-aegis/[0.07] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-aegis">
              <Landmark className="h-3.5 w-3.5" /> The protocol
            </p>
            <h2 className="font-display text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
              Three steps to a <span className="text-gradient">hardened wallet.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1}>
              <div className="glass card-hover relative h-full overflow-hidden rounded-2xl p-7">
                <span className="pointer-events-none absolute -right-3 -top-5 font-display text-[88px] font-bold leading-none text-white/[0.045]">
                  {s.step}
                </span>
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-aegis/25 bg-aegis/[0.08] text-aegis">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-white">{s.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-fog">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- golden rules ----------------------------- */

const RULES = [
  "Never type your 12 or 24-word recovery phrase into any website — including this one.",
  "Real support never DMs first and never asks for phrases, keys or “validation”.",
  "Verify addresses character-by-character, not just the first and last few.",
  "Bookmark official sites; never follow links from DMs, texts or ads.",
  "Keep significant holdings on a hardware wallet, not a hot wallet.",
  "Test every new receiving flow with a small amount first.",
  "Review and revoke stale token approvals monthly.",
  "“Flash” or “pending release” balances that require a fee to unlock are always fake.",
];

const NEVER = [
  "Your 12/24-word recovery phrase",
  "Private keys or keystore files",
  "“Validation” or “synchronization” signatures",
  "Fees to unlock flashed or frozen balances",
];

function GoldenRules() {
  return (
    <section id="rules" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <Reveal>
          <div className="lg:sticky lg:top-24">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-warn/25 bg-amber-warn/[0.07] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-warn">
              <AlertTriangle className="h-3.5 w-3.5" /> Golden rules
            </p>
            <h2 className="font-display text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
              Eight habits that stop <span className="text-gradient">99% of losses.</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-fog">
              Scams succeed by rushing you past your own safeguards. Print these, pin them, and
              make them muscle memory. Your Security Score grows as you complete each practice in
              the dashboard.
            </p>

            <div className="mt-8 rounded-2xl border border-danger/25 bg-danger/[0.06] p-6">
              <p className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.12em] text-danger">
                <ShieldX className="h-4 w-4" /> AegisVault will never ask for
              </p>
              <ul className="space-y-2.5">
                {NEVER.map((n) => (
                  <li key={n} className="flex items-start gap-2.5 text-[13.5px] text-mist">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger/80" />
                    {n}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-danger/15 pt-4 text-xs leading-relaxed text-fog">
                Any site, app or person requesting these is attempting theft — even if it looks
                professional, and even if it claims to be us.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="space-y-3">
          {RULES.map((rule, i) => (
            <Reveal key={rule} delay={i * 0.05}>
              <div className="glass card-hover flex items-start gap-4 rounded-2xl p-5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-aegis/25 bg-aegis/[0.08] font-display text-[13px] font-bold text-aegis">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[14.5px] leading-relaxed text-mist">{rule}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ review section ----------------------------- */

function ReviewExplainer() {
  const items = [
    {
      icon: Globe,
      title: "Dataset screening",
      body: "Submitted public addresses are screened against known fraud, phishing and mixer-flag datasets.",
    },
    {
      icon: UserCheck,
      title: "Human reviewer",
      body: "A trained compliance reviewer confirms format, chain and screening results before approving.",
    },
    {
      icon: Smartphone,
      title: "Live status updates",
      body: "Pending → Connected (or Protected) the moment review completes — visible instantly in your dashboard.",
    },
  ];
  return (
    <section id="review" className="relative border-y border-line/60 bg-abyss/60 py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-glow/25 bg-glow/[0.07] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-glow">
              <Flame className="h-3.5 w-3.5" /> Human review layer
            </p>
            <h2 className="font-display text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
              Automation flags. <span className="text-gradient">Humans decide.</span>
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fog">
              Every wallet connection and backup verification enters a review queue staffed by our
              compliance team. Nothing is auto-approved — that friction is the feature. It keeps
              poisoned addresses and sloppy backups out of your security perimeter.
            </p>
            <div className="mt-8 space-y-5">
              {items.map((it) => (
                <div key={it.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white/[0.03] text-aegis">
                    <it.icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{it.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-fog">{it.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="glass noise relative overflow-hidden rounded-3xl p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-aegis/10 blur-3xl" />
              <p className="mb-5 font-display text-xs font-bold uppercase tracking-[0.18em] text-fog">
                Review queue · live
              </p>
              <div className="space-y-3">
                {[
                  { w: "MetaMask · 0x8fE2…3D2a", s: "Pending", tone: "text-amber-warn border-amber-warn/30 bg-amber-warn/10" },
                  { w: "Ledger · bc1q4k…9vtx", s: "Connected", tone: "text-aegis border-aegis/30 bg-aegis/10" },
                  { w: "Phantom · 7YkW…f2Qm", s: "Connected", tone: "text-aegis border-aegis/30 bg-aegis/10" },
                  { w: "Backup · Steel plate", s: "Protected", tone: "text-aegis border-aegis/30 bg-aegis/10" },
                  { w: "Trust · TYmP…9uHe", s: "Flagged", tone: "text-danger border-danger/30 bg-danger/10" },
                ].map((row, i) => (
                  <motion.div
                    key={row.w}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.09, duration: 0.6, ease }}
                    className="flex items-center justify-between rounded-xl border border-line bg-white/[0.02] px-4 py-3"
                  >
                    <span className="mono text-[12.5px] text-mist">{row.w}</span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${row.tone}`}
                    >
                      {row.s}
                    </span>
                  </motion.div>
                ))}
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-fog">
                <Lock className="h-3.5 w-3.5 text-aegis" />
                Reviewers see public addresses and checklist attestations only — never secrets.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- CTA ----------------------------------- */

function Cta() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Reveal>
        <div className="glass noise relative overflow-hidden rounded-[32px] px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-aegis/15 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-glow/15 blur-[100px]" />
          <ShieldCheck className="mx-auto mb-6 h-12 w-12 text-aegis" />
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
            Your keys stay yours. <span className="text-gradient">Your security gets a team.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-fog">
            Create your account, connect your first wallet and verify your backup — all before
            lunch. The scammers are already working. So are we.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-aegis px-7 py-3.5 text-sm font-bold text-[#04120c] shadow-[0_14px_44px_-10px_rgba(23,232,160,0.65)] transition hover:bg-[#3cf5b4]"
            >
              Start protecting now
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-mist transition hover:border-aegis/40 hover:text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------------------------- footer --------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-line/60 bg-abyss/80">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[13px] leading-relaxed text-fog">
              Human-reviewed wallet protection and scam-prevention training. Non-custodial by
              design: we store public addresses and security attestations — never keys, phrases,
              or secrets.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-[13px] sm:grid-cols-3">
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white">Platform</p>
              <ul className="space-y-2 text-fog">
                <li><a href="#threats" className="transition hover:text-white">Threat library</a></li>
                <li><a href="#how" className="transition hover:text-white">How it works</a></li>
                <li><a href="#rules" className="transition hover:text-white">Golden rules</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white">Account</p>
              <ul className="space-y-2 text-fog">
                <li><Link href="/register" className="transition hover:text-white">Create account</Link></li>
                <li><Link href="/login" className="transition hover:text-white">Sign in</Link></li>
                <li><Link href="/login" className="transition hover:text-white">Admin console</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white">Safety</p>
              <ul className="space-y-2 text-fog">
                <li className="inline-flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-aegis" /> Zero seed collection</li>
                <li className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-aegis" /> Non-custodial</li>
                <li className="inline-flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5 text-aegis" /> Human review</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line/60 pt-6 text-xs text-fog/70 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} AegisVault Security Labs. Education and screening — not financial advice.</p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-aegis" />
            If a site asks for your recovery phrase, it is a scam. Full stop.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Stats />
      <Threats />
      <HowItWorks />
      <GoldenRules />
      <ReviewExplainer />
      <Cta />
      <Footer />
    </main>
  );
}
