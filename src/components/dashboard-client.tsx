"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Clock,
  Database,
  EyeOff,
  FileClock,
  HardDrive,
  History,
  LogOut,
  Menu,
  Bell,
  X,
  Plus,
  ShieldCheck,
  Wallet,
  XOctagon,
} from "lucide-react";
import { toast } from "sonner";
import { ConnectWalletModal } from "@/components/connect-wallet-modal";
import { BackupModal } from "@/components/backup-modal";
import { ScoreRing } from "@/components/score-ring";
import { Button, Card, EmptyState, StatusBadge } from "@/components/ui";
import { logoutAction } from "@/lib/actions";
import { BACKUP_METHODS, getWalletType, shortAddress } from "@/lib/wallets";

const ease = [0.22, 1, 0.36, 1] as const;

type WalletRequest = { id: string; userId: string; walletType: string; label: string | null; address: string; chain: string; status: "pending" | "approved" | "rejected"; reviewNote: string | null; reviewedBy: string | null; reviewedAt: string | null; createdAt: string };
type BackupRequest = { id: string; userId: string; method: "paper" | "steel" | "hardware" | "shamir"; walletType: string; checklist: Record<string, boolean>; status: "pending" | "approved" | "rejected"; reviewNote: string | null; reviewedBy: string | null; reviewedAt: string | null; createdAt: string };
type ActivityEvent = { id: string; userId: string; kind: string; message: string; isAdminVisible: boolean; createdAt: string };

function statusCopy(kind: "wallet" | "backup", status: "pending" | "approved" | "rejected") {
  if (status === "pending") return { tone: "pending" as const, label: "Pending review" };
  if (status === "rejected") return { tone: "rejected" as const, label: "Declined" };
  return kind === "wallet"
    ? { tone: "approved" as const, label: "Connected" }
    : { tone: "approved" as const, label: "Protected" };
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardClient({
  user,
  wallets,
  backups,
  activity,
  score,
}: {
  user: { fullName: string; email: string };
  wallets: WalletRequest[];
  backups: BackupRequest[];
  activity: ActivityEvent[];
  score: number;
}) {
  const router = useRouter();
  const [connectOpen, setConnectOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  const firstName = user.fullName.split(" ")[0];
  const walletPoints = (wallets.some((w) => w.status === "approved") ? 38 : 0) +
    (wallets.some((w) => w.status === "pending") ? 10 : 0);
  const backupPoints = (backups.some((b) => b.status === "approved") ? 37 : 0) +
    (backups.some((b) => b.status === "pending") ? 10 : 0);

  return (
    <main className="relative min-h-screen">
      <div className="bg-grid absolute inset-x-0 top-0 h-[440px]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-aegis/[0.07] blur-[120px]" />

      {/* topbar */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-aegis to-glow">
              <ShieldCheck className="h-4.5 w-4.5 text-[#04120c]" strokeWidth={2.4} />
            </span>
            <span className="font-display text-base font-bold tracking-tight text-white">
              Aegis<span className="text-aegis">Vault</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2.5 rounded-xl border border-line bg-white/[0.03] px-3.5 py-2 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-aegis/15 font-display text-[11px] font-bold text-aegis">
                {firstName[0]?.toUpperCase()}
              </span>
              <span className="max-w-[160px] truncate text-[13px] font-medium text-mist">{user.email}</span>
            </div>
            <button type="button" aria-label="Open activity history" title="Activity history"
              onClick={() => document.getElementById("activity-history")?.scrollIntoView({behavior:"smooth",block:"start"})}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white/[0.04] text-mist hover:border-aegis/40 hover:text-aegis">
              <Bell className="h-5 w-5" />
              {activity.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-aegis ring-2 ring-ink" />}
            </button>
            <div className="relative">
              <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close dashboard menu" : "Open dashboard menu"}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white/[0.04] text-mist hover:border-aegis/40 hover:text-aegis">
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              {menuOpen && <nav className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-line-strong bg-panel p-2 shadow-2xl">
                {[
                  {label:"Dashboard",href:"#dashboard"},
                  {label:"Wallet protection",href:"#wallet-protection"},
                  {label:"Backup verification",href:"#backup-verification"},
                  {label:"Activity history",href:"#activity-history"},
                  {label:"AegisVault home",href:"/"},
                ].map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3.5 py-2.5 text-sm text-mist hover:bg-aegis/[0.08] hover:text-aegis">{item.label}</a>)}
                <div className="my-1 border-t border-line" />
                <button type="button" disabled={signingOut} onClick={() => startSignOut(async () => {
                  try { await logoutAction(); toast.success("Signed out. Stay vigilant."); }
                  finally { router.push("/"); router.refresh(); }
                })} className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm text-danger hover:bg-danger/10">
                  <LogOut className="h-4 w-4" /> {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </nav>}
            </div>
          </div>
        </div>
      </header>

      <div id="dashboard" className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8">
        {/* greeting */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mb-8"
        >
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-aegis">
            Security dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stay hardened, {firstName}.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fog">
            Connect wallets for protection screening and verify your backups. Every request is
            reviewed by a human analyst before it flips to{" "}
            <span className="font-semibold text-aegis">Connected</span> or{" "}
            <span className="font-semibold text-aegis">Protected</span>.
          </p>
        </motion.div>

        {/* safety banner */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
          className="mb-8 flex items-start gap-3.5 rounded-2xl border border-aegis/25 bg-gradient-to-r from-aegis/[0.09] to-glow/[0.05] px-5 py-4"
        >
          <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-aegis" />
          <p className="text-[13px] leading-relaxed text-mist">
            <span className="font-bold text-white">Reminder:</span> AegisVault operates on public
            addresses and security attestations only.{" "}
            <span className="font-semibold text-aegis">
              We never ask for recovery phrases — and neither should anyone else.
            </span>{" "}
            If a “support agent” requests your 12/24 words, you are being scammed.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          {/* left: score */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease }}
            className="space-y-5"
          >
            <Card className="noise relative overflow-hidden p-7">
              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-aegis/10 blur-3xl" />
              <div className="flex flex-col items-center">
                <ScoreRing score={score} />
                <p className="mt-4 text-center text-xs leading-relaxed text-fog">
                  {score >= 80
                    ? "Excellent — wallet protected and backup verified."
                    : score >= 55
                      ? "Strong — one layer awaiting approval."
                      : "Complete the two protection layers below to raise your score."}
                </p>
              </div>
              <div className="mt-6 space-y-3.5 border-t border-line pt-5">
                {[
                  { label: "Account base", pts: 25, earned: 25 },
                  { label: "Wallet connected", pts: 38, earned: Math.min(walletPoints, 38) },
                  { label: "Backup verified", pts: 37, earned: Math.min(backupPoints, 37) },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-fog">{row.label}</span>
                      <span className="font-semibold text-mist">
                        {row.earned}/{row.pts}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-aegis to-glow"
                        initial={{ width: 0 }}
                        animate={{ width: `${(row.earned / row.pts) * 100}%` }}
                        transition={{ duration: 1.1, delay: 0.5, ease }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* activity */}
            <Card className="p-6">
              <p className="mb-4 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-fog">
                <History className="h-4 w-4 text-aegis" /> Activity
              </p>
              <div className="slim-scroll max-h-[320px] space-y-3 overflow-y-auto pr-1">
                {activity.length === 0 && (
                  <p className="text-xs text-fog/70">No events yet — submit a protection request.</p>
                )}
                {activity.map((ev) => (
                  <div key={ev.id} className="flex gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-aegis">
                      {ev.kind === "wallet" ? (
                        <Wallet className="h-3 w-3" />
                      ) : ev.kind === "backup" ? (
                        <Database className="h-3 w-3" />
                      ) : (
                        <Activity className="h-3 w-3" />
                      )}
                    </span>
                    <div>
                      <p className="text-xs leading-snug text-mist">{ev.message}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-fog/60">
                        {fmtDate(ev.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* right: protection layers */}
          <div className="space-y-5">
            {/* wallet protection */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.18, ease }}
            >
              <Card className="p-6 sm:p-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-white">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-aegis/25 bg-aegis/[0.08] text-aegis">
                        <Wallet className="h-4.5 w-4.5" />
                      </span>
                      Wallet protection
                    </h2>
                    <p className="mt-1.5 text-[12.5px] text-fog">
                      Connect wallets by public address · human-reviewed · pending → connected
                    </p>
                  </div>
                  <Button onClick={() => setConnectOpen(true)}>
                    <Plus className="h-4 w-4" /> Connect wallet
                  </Button>
                </div>

                {wallets.length === 0 ? (
                  <EmptyState
                    icon={<Wallet className="h-5 w-5" />}
                    title="No wallets under protection yet"
                    body="Connect your first wallet with its public address. An analyst reviews it — once approved, the address is monitored and shows as Connected."
                    action={
                      <Button variant="outline" onClick={() => setConnectOpen(true)}>
                        <Plus className="h-4 w-4" /> Connect your first wallet
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-2.5">
                    {wallets.map((w, i) => {
                      const meta = getWalletType(w.walletType);
                      const sc = statusCopy("wallet", w.status);
                      return (
                        <motion.div
                          key={w.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + i * 0.06, duration: 0.5, ease }}
                          className="flex flex-col gap-3 rounded-2xl border border-line bg-white/[0.02] p-4 sm:flex-row sm:items-center"
                        >
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white/[0.04]"
                            style={{ color: meta?.accent ?? "#17e8a0" }}
                          >
                            <Wallet className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                              {meta?.name ?? w.walletType}
                              {w.label && <span className="ml-2 text-xs font-normal text-fog">· {w.label}</span>}
                            </p>
                            <p className="mono mt-0.5 text-xs text-aegis/90">
                              {shortAddress(w.address)} · {w.chain}
                            </p>
                            {w.status === "rejected" && w.reviewNote && (
                              <p className="mt-1 flex items-center gap-1 text-[11px] text-danger/90">
                                <XOctagon className="h-3 w-3" /> {w.reviewNote}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                            <StatusBadge tone={sc.tone}>{sc.label}</StatusBadge>
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-fog/60">
                              <Clock className="h-3 w-3" />
                              {fmtDate(w.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* backup verification */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.24, ease }}
            >
              <Card className="p-6 sm:p-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-white">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-glow/25 bg-glow/[0.08] text-glow">
                        <HardDrive className="h-4.5 w-4.5" />
                      </span>
                      Backup verification
                    </h2>
                    <p className="mt-1.5 text-[12.5px] text-fog">
                      Attest safe offline storage · analyst-approved · phrase never collected
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setBackupOpen(true)}>
                    <Plus className="h-4 w-4" /> Backup wallet
                  </Button>
                </div>

                {backups.length === 0 ? (
                  <EmptyState
                    icon={<HardDrive className="h-5 w-5" />}
                    title="No backup verification requested"
                    body="Run the guided checklist to verify your recovery setup is airtight — without ever revealing the phrase itself."
                    action={
                      <Button variant="outline" onClick={() => setBackupOpen(true)}>
                        <Plus className="h-4 w-4" /> Start backup verification
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-2.5">
                    {backups.map((b, i) => {
                      const meta = getWalletType(b.walletType);
                      const method = BACKUP_METHODS.find((m) => m.id === b.method);
                      const confirmed = Object.values(b.checklist ?? {}).filter(Boolean).length;
                      const sc = statusCopy("backup", b.status);
                      return (
                        <motion.div
                          key={b.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease }}
                          className="flex flex-col gap-3 rounded-2xl border border-line bg-white/[0.02] p-4 sm:flex-row sm:items-center"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-glow/25 bg-glow/[0.07] text-glow">
                            <HardDrive className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                              {meta?.name ?? b.walletType} backup
                            </p>
                            <p className="mt-0.5 text-xs text-fog">
                              {method?.label} · {confirmed}/6 practices confirmed
                            </p>
                            {b.status === "rejected" && b.reviewNote && (
                              <p className="mt-1 flex items-center gap-1 text-[11px] text-danger/90">
                                <XOctagon className="h-3 w-3" /> {b.reviewNote}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                            <StatusBadge tone={sc.tone}>{sc.label}</StatusBadge>
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-fog/60">
                              <Clock className="h-3 w-3" />
                              {fmtDate(b.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* educational tip */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.3, ease }}
              className="flex items-start gap-4 rounded-2xl border border-amber-warn/25 bg-amber-warn/[0.05] p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-warn/25 bg-amber-warn/10 text-amber-warn">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Spot the “wallet flashing” trick</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-fog">
                  Scammers show fake USDT or BTC balances in a “watch-only” or imported wallet, then
                  demand a fee to “unlock” them. Real funds settle on-chain and never need a release
                  fee. When in doubt, verify the balance on a public block explorer — never in the
                  app a stranger gave you.
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-warn/90">
                  <FileClock className="h-3.5 w-3.5" /> Median human review time: under 24 hours
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ConnectWalletModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      <BackupModal open={backupOpen} onClose={() => setBackupOpen(false)} />
    </main>
  );
}
