"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity as ActivityIcon,
  BadgeCheck,
  Check,
  ClipboardCheck,
  Clock,
  Database,
  FileClock,
  HardDrive,
  LogOut,
  ShieldCheck,
  ShieldX,
  UserRound,
  Users,
  Trash2,
  Settings,
  KeyRound,
  Save,
  Wallet,
  X,
} from "lucide-react";
import { Button, Card, Modal, StatusBadge, Textarea, cx } from "@/components/ui";
import { logoutAction, reviewBackupRequest, reviewWalletRequest, adminDeleteUser, adminDeleteRequest, adminUpdateSettings, adminChangePassword } from "@/lib/actions";
import { BACKUP_CHECKLIST, BACKUP_METHODS, getWalletType, shortAddress } from "@/lib/wallets";

const ease = [0.22, 1, 0.36, 1] as const;

type User = { id: string; fullName: string; email: string; role: "user" | "admin"; createdAt: string };
type WalletRequest = { id: string; userId: string; walletType: string; label: string | null; address: string; chain: string; status: "pending" | "approved" | "rejected"; reviewNote: string | null; reviewedBy: string | null; reviewedAt: string | null; createdAt: string };
type BackupRequest = { id: string; userId: string; method: "paper" | "steel" | "hardware" | "shamir"; walletType: string; checklist: Record<string, boolean>; address?: string | null; chain?: string | null; status: "pending" | "approved" | "rejected"; reviewNote: string | null; reviewedBy: string | null; reviewedAt: string | null; createdAt: string };
type ActivityEvent = { id: string; userId: string; kind: string; message: string; isAdminVisible: boolean; createdAt: string };

export type WalletRow = WalletRequest & { userName: string; userEmail: string };
export type BackupRow = BackupRequest & { userName: string; userEmail: string };
export type ActivityRow = ActivityEvent & { userEmail: string };

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(d: Date | string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusTone(status: "pending" | "approved" | "rejected") {
  return status === "pending" ? ("pending" as const) : status === "approved" ? ("approved" as const) : ("rejected" as const);
}

type ReviewTarget =
  | { kind: "wallet"; row: WalletRow }
  | { kind: "backup"; row: BackupRow };

export default function AdminClient({
  admin,
  appName,
  users,
  walletRows,
  backupRows,
  activity,
}: {
  admin: { fullName: string; email: string };
  appName: string;
  users: User[];
  walletRows: WalletRow[];
  backupRows: BackupRow[];
  activity: ActivityRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"queue" | "wallets" | "backups" | "users" | "activity" | "settings">("queue");
  const [target, setTarget] = useState<ReviewTarget | null>(null);
  const [note, setNote] = useState("");
  const [appNameInput, setAppNameInput] = useState(appName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, start] = useTransition();
  const [signingOut, startSignOut] = useTransition();

  const pendingWallets = walletRows.filter((r) => r.status === "pending");
  const pendingBackups = backupRows.filter((r) => r.status === "pending");
  const pendingTotal = pendingWallets.length + pendingBackups.length;
  const approvedTotal =
    walletRows.filter((r) => r.status === "approved").length +
    backupRows.filter((r) => r.status === "approved").length;

  function decide(decision: "approved" | "rejected") {
    if (!target) return;
    start(async () => {
      try {
        const res =
          target.kind === "wallet"
            ? await reviewWalletRequest({ requestId: target.row.id, decision, note })
            : await reviewBackupRequest({ requestId: target.row.id, decision, note });
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success(
          decision === "approved"
            ? target.kind === "wallet"
              ? "Approved — wallet is now Connected for the user."
              : "Approved — backup is now Protected for the user."
            : "Request declined with note.",
        );
        setTarget(null);
        setNote("");
        router.refresh();
      } catch {
        toast.error("Network hiccup reaching the server — please retry.");
      }
    });
  }

  function removeRequest(kind: "wallet" | "backup", requestId: string) {
    if (!window.confirm("Permanently delete this request? This cannot be undone.")) return;
    start(async () => { const res = await adminDeleteRequest({ kind, requestId }); if (!res.ok) { toast.error(res.error); return; } toast.success("Request deleted."); router.refresh(); });
  }
  function removeUser(user: User) {
    if (!window.confirm("Delete " + user.email + "? Their wallets, backups and activity will also be deleted.")) return;
    start(async () => { const res = await adminDeleteUser({ userId: user.id }); if (!res.ok) { toast.error(res.error); return; } toast.success("User and associated records deleted."); router.refresh(); });
  }
  function saveAppName() {
    start(async () => { const res = await adminUpdateSettings({ appName: appNameInput.trim() }); if (!res.ok) { toast.error(res.error); return; } toast.success("Application name updated."); router.refresh(); });
  }
  function changePassword() {
    start(async () => { const res = await adminChangePassword({ currentPassword, newPassword }); if (!res.ok) { toast.error(res.error); return; } toast.success("Password changed. Please sign in again."); router.push("/login"); router.refresh(); });
  }
  const TABS = [
    { id: "queue" as const, label: "Review queue", icon: FileClock, count: pendingTotal },
    { id: "wallets" as const, label: "Wallet requests", icon: Wallet, count: walletRows.length },
    { id: "backups" as const, label: "Backup requests", icon: HardDrive, count: backupRows.length },
    { id: "users" as const, label: "Users", icon: Users, count: users.length },
    { id: "activity" as const, label: "Activity", icon: ActivityIcon, count: activity.length },
    { id: "settings" as const, label: "Settings", icon: Settings, count: 0 },
  ];

  return (
    <main className="relative min-h-screen">
      <div className="bg-grid absolute inset-x-0 top-0 h-[380px]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-glow/[0.06] blur-[120px]" />

      {/* topbar */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-aegis to-glow">
              <ShieldCheck className="h-4.5 w-4.5 text-[#04120c]" strokeWidth={2.4} />
            </span>
            <span className="font-display text-base font-bold tracking-tight text-white">
              {appName}
            </span>
            <span className="ml-1 rounded-full border border-glow/30 bg-glow/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-glow">
              Admin console
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 rounded-xl border border-line bg-white/[0.03] px-3.5 py-2 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-glow/15 font-display text-[11px] font-bold text-glow">
                {admin.fullName[0]?.toUpperCase()}
              </span>
              <span className="max-w-[180px] truncate text-[13px] font-medium text-mist">{admin.email}</span>
            </div>
            <Button
              variant="subtle"
              loading={signingOut}
              onClick={() =>
                startSignOut(async () => {
                  try {
                    await logoutAction();
                  } catch {
                    // still navigate; session cookie expiry handles the rest
                  }
                  router.push("/");
                  router.refresh();
                })
              }
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Compliance review</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fog">
            Screen pending wallet connections and backup verifications. Approvals flip user
            dashboards from <span className="font-semibold text-amber-warn">Pending</span> to{" "}
            <span className="font-semibold text-aegis">Connected</span> /{" "}
            <span className="font-semibold text-aegis">Protected</span> instantly.
          </p>
        </motion.div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Pending reviews", value: pendingTotal, icon: FileClock, tone: "text-amber-warn border-amber-warn/25 bg-amber-warn/[0.07]" },
            { label: "Approved protections", value: approvedTotal, icon: BadgeCheck, tone: "text-aegis border-aegis/25 bg-aegis/[0.07]" },
            { label: "Registered users", value: users.filter((u) => u.role === "user").length, icon: Users, tone: "text-glow border-glow/25 bg-glow/[0.07]" },
            { label: "Total requests", value: walletRows.length + backupRows.length, icon: ClipboardCheck, tone: "text-mist border-line-strong bg-white/[0.03]" },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-3xl font-bold tracking-tight text-white">{s.value}</p>
                  <p className="mt-1 text-[12px] text-fog">{s.label}</p>
                </div>
                <span className={cx("flex h-11 w-11 items-center justify-center rounded-xl border", s.tone)}>
                  <s.icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease }}
          className="mt-8 flex gap-2 overflow-x-auto pb-2"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cx(
                "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 sm:px-4 py-2.5 text-[13px] font-semibold transition-all duration-300",
                tab === t.id
                  ? "border-aegis/50 bg-aegis/[0.1] text-white"
                  : "border-line bg-white/[0.02] text-fog hover:border-aegis/25 hover:text-white",
              )}
            >
              <t.icon className={cx("h-4 w-4", tab === t.id ? "text-aegis" : "text-fog")} />
              {t.label}
              {t.count > 0 && (
                <span
                  className={cx(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    t.id === "queue" && t.count > 0
                      ? "bg-amber-warn/20 text-amber-warn"
                      : "bg-white/[0.07] text-mist",
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="mt-5 space-y-5"
        >
          {(tab === "queue" || tab === "wallets") && (
            <Card className="p-6 sm:p-7">
              <h2 className="mb-1 flex items-center gap-2.5 font-display text-lg font-semibold text-white">
                <Wallet className="h-5 w-5 text-aegis" />
                {tab === "queue" ? "Pending wallet connections" : "All wallet connection requests"}
              </h2>
              <p className="mb-5 text-[12.5px] text-fog">
                Public addresses only — reviewers never see keys or phrases; they verify format,
                chain and fraud-dataset screening results.
              </p>
              <WalletTable rows={tab === "queue" ? pendingWallets : walletRows} onReview={(row) => setTarget({ kind: "wallet", row })} onDelete={(row) => removeRequest("wallet", row.id)} />
            </Card>
          )}

          {(tab === "queue" || tab === "backups") && (
            <Card className="p-6 sm:p-7">
              <h2 className="mb-1 flex items-center gap-2.5 font-display text-lg font-semibold text-white">
                <HardDrive className="h-5 w-5 text-glow" />
                {tab === "queue" ? "Pending backup verifications" : "All backup verification requests"}
              </h2>
              <p className="mb-5 text-[12.5px] text-fog">
                Attestation checklists submitted by users — approve when hygiene practices are complete.
              </p>
              <BackupTable rows={tab === "queue" ? pendingBackups : backupRows} onReview={(row) => setTarget({ kind: "backup", row })} onDelete={(row) => removeRequest("backup", row.id)} />
            </Card>
          )}

          {tab === "users" && (
            <Card className="p-6 sm:p-7">
              <h2 className="mb-5 flex items-center gap-2.5 font-display text-lg font-semibold text-white">
                <Users className="h-5 w-5 text-aegis" /> Registered accounts
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-fog/70">
                      <th className="pb-3 pr-4 font-semibold">User</th>
                      <th className="pb-3 pr-4 font-semibold">Role</th>
                      <th className="pb-3 pr-4 font-semibold">Wallets</th>
                      <th className="pb-3 pr-4 font-semibold">Backups</th>
                      <th className="pb-3 font-semibold">Joined</th><th className="pb-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-line/50 last:border-0">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aegis/12 font-display text-xs font-bold text-aegis">
                              {u.fullName[0]?.toUpperCase()}
                            </span>
                            <div>
                              <p className="font-semibold text-white">{u.fullName}</p>
                              <p className="text-xs text-fog">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <StatusBadge tone={u.role === "admin" ? "info" : "neutral"}>{u.role}</StatusBadge>
                        </td>
                        <td className="py-3.5 pr-4 text-mist">
                          {walletRows.filter((w) => w.userId === u.id).length}
                        </td>
                        <td className="py-3.5 pr-4 text-mist">
                          {backupRows.filter((b) => b.userId === u.id).length}
                        </td>
                        <td className="py-3.5 text-fog">{fmtDate(u.createdAt)}</td><td className="py-3.5"><Button variant="danger" onClick={() => removeUser(u)}><Trash2 className="h-4 w-4" /> Delete</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "settings" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-4 sm:p-6 lg:p-7">
                <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-white"><Settings className="h-5 w-5 text-aegis" /> Application settings</h2>
                <p className="mb-5 text-sm text-fog">Change the name displayed in the admin console.</p>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveAppName(); }}>
                  <label className="block text-sm text-mist">Application name<input value={appNameInput} onChange={(e) => setAppNameInput(e.target.value)} maxLength={80} required className="mt-2 w-full rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-aegis" /></label>
                  <Button type="submit" loading={pending}><Save className="h-4 w-4" /> Save app name</Button>
                </form>
              </Card>
              <Card className="p-4 sm:p-6 lg:p-7">
                <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-white"><KeyRound className="h-5 w-5 text-aegis" /> Change password</h2>
                <p className="mb-5 text-sm text-fog">Enter your current password. You will be signed out after the change.</p>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); changePassword(); }}>
                  <label className="block text-sm text-mist">Current password<input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-2 w-full rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-aegis" /></label>
                  <label className="block text-sm text-mist">New password (minimum 10 characters)<input type="password" autoComplete="new-password" minLength={10} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-2 w-full rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-aegis" /></label>
                  <Button type="submit" loading={pending}><KeyRound className="h-4 w-4" /> Update password</Button>
                </form>
              </Card>
            </div>
          )}
          {tab === "activity" && (
            <Card className="p-6 sm:p-7">
              <h2 className="mb-5 flex items-center gap-2.5 font-display text-lg font-semibold text-white">
                <ActivityIcon className="h-5 w-5 text-aegis" /> Platform activity
              </h2>
              <div className="space-y-2.5">
                {activity.length === 0 && <p className="text-sm text-fog">No platform events yet.</p>}
                {activity.map((ev) => (
                  <div key={ev.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-aegis">
                      {ev.kind === "wallet" ? <Wallet className="h-3.5 w-3.5" /> : ev.kind === "backup" ? <HardDrive className="h-3.5 w-3.5" /> : <ActivityIcon className="h-3.5 w-3.5" />}
                    </span>
                    <p className="min-w-0 flex-1 text-[13px] text-mist">{ev.message}</p>
                    <span className="text-xs text-fog">{ev.userEmail}</span>
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-fog/60">
                      <Clock className="h-3 w-3" /> {fmtTime(ev.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </div>

      {/* review modal */}
      <Modal open={!!target} onClose={() => setTarget(null)} title="Review request" wide>
        {target && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-fog">
                  <UserRound className="h-3.5 w-3.5" /> Submitted by
                </p>
                <p className="text-sm font-semibold text-white">{target.row.userName}</p>
                <p className="text-xs text-fog">{target.row.userEmail}</p>
                <p className="mt-2 flex items-center gap-1 text-[11px] text-fog/70">
                  <Clock className="h-3 w-3" /> {fmtTime(target.row.createdAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-fog">
                  {target.kind === "wallet" ? <Wallet className="h-3.5 w-3.5" /> : <HardDrive className="h-3.5 w-3.5" />}
                  {target.kind === "wallet" ? "Wallet details" : "Backup details"}
                </p>
                {target.kind === "wallet" ? (
                  <>
                    <p className="text-sm font-semibold text-white">
                      {getWalletType(target.row.walletType)?.name ?? target.row.walletType}
                      {target.row.label && <span className="ml-2 text-xs font-normal text-fog">· {target.row.label}</span>}
                    </p>
                    <p className="mono mt-1 break-all text-xs leading-relaxed text-aegis/90">{target.row.address}</p>
                    <p className="mt-1.5 text-[11px] text-fog">Chain: {target.row.chain} · Format check passed</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-white">
                      {getWalletType(target.row.walletType)?.name ?? target.row.walletType} backup verification
                    </p>
                    {target.row.address ? (
                      <>
                        <p className="mono mt-1 break-all text-xs leading-relaxed text-aegis/90">{target.row.address}</p>
                        <p className="mt-1.5 text-[11px] text-fog">Network: {target.row.chain ?? "Other"} · Public address submitted</p>
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-fog">
                        Legacy backup method: {BACKUP_METHODS.find((m) => m.id === target.row.method)?.label}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {target.kind === "backup" && (
              <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-fog">
                  Attested security practices
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BACKUP_CHECKLIST.map((c) => {
                    const yes = Boolean(target.row.checklist?.[c.id]);
                    return (
                      <div key={c.id} className="flex items-center gap-2 text-[12.5px]">
                        <span
                          className={cx(
                            "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border",
                            yes ? "border-aegis/50 bg-aegis/15 text-aegis" : "border-danger/40 bg-danger/10 text-danger",
                          )}
                        >
                          {yes ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        <span className={yes ? "text-mist" : "text-fog/70"}>{c.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-2xl border border-aegis/20 bg-aegis/[0.05] px-4 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-aegis" />
              <p className="text-xs leading-relaxed text-fog">
                {target.kind === "wallet"
                  ? "Approving marks this public address Connected & monitored on the user's dashboard. Declining notifies the user with your note."
                  : "Approving marks this backup Protected and raises the user's Security Score. Declining notifies the user with your note."}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-mist">
                Review note <span className="font-normal text-fog/60">(optional — shown to the user if declined)</span>
              </label>
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Address format verified; screening clean."
                maxLength={280}
              />
            </div>

            <div className="flex gap-2.5">
              <Button variant="danger" className="flex-1 py-3" loading={pending} onClick={() => decide("rejected")}>
                <ShieldX className="h-4 w-4" /> Decline
              </Button>
              <Button className="flex-[2] py-3" loading={pending} onClick={() => decide("approved")}>
                <BadgeCheck className="h-4 w-4" /> Approve request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

/* --------------------------------- tables ---------------------------------- */

function WalletTable({ rows, onReview, onDelete }: { rows: WalletRow[]; onReview: (r: WalletRow) => void; onDelete: (r: WalletRow) => void }) {
  if (rows.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center text-sm text-fog">
        Nothing here — the queue is clear.
      </div>
    );
  return (
    <div className="space-y-2.5">
      {rows.map((r) => {
        const meta = getWalletType(r.walletType);
        return (
          <div key={r.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white/[0.02] p-4 lg:flex-row lg:items-center">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white/[0.04]"
              style={{ color: meta?.accent ?? "#17e8a0" }}
            >
              <Wallet className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">
                {meta?.name ?? r.walletType}
                {r.label && <span className="ml-2 text-xs font-normal text-fog">· {r.label}</span>}
              </p>
              <p className="mono mt-0.5 truncate text-xs text-aegis/90">
                {shortAddress(r.address)} · {r.chain}
              </p>
            </div>
            <div className="min-w-0 lg:w-48">
              <p className="truncate text-[13px] font-medium text-mist">{r.userName}</p>
              <p className="truncate text-xs text-fog">{r.userEmail}</p>
            </div>
            <div className="flex items-center justify-between gap-3 lg:w-auto lg:justify-end">
              <StatusBadge tone={statusTone(r.status)}>
                {r.status === "approved" ? "Connected" : r.status}
              </StatusBadge>
              {r.status === "pending" ? (
                <Button variant="outline" onClick={() => onReview(r)}>
                  Review
                </Button>
              ) : (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-fog/60">
                  <Clock className="h-3 w-3" /> {r.reviewedAt ? fmtDate(r.reviewedAt) : fmtDate(r.createdAt)}
                </span>
              )}
              <Button variant="danger" onClick={() => onDelete(r)}><Trash2 className="h-4 w-4" /><span className="hidden sm:inline">Delete</span></Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BackupTable({ rows, onReview, onDelete }: { rows: BackupRow[]; onReview: (r: BackupRow) => void; onDelete: (r: BackupRow) => void }) {
  if (rows.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center text-sm text-fog">
        Nothing here — the queue is clear.
      </div>
    );
  return (
    <div className="space-y-2.5">
      {rows.map((r) => {
        const meta = getWalletType(r.walletType);

        return (
          <div key={r.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white/[0.02] p-4 lg:flex-row lg:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-glow/25 bg-glow/[0.07] text-glow">
              <HardDrive className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{meta?.name ?? r.walletType} backup verification</p>
              <p className="mono mt-0.5 break-all text-xs text-fog">
                {r.address ? `${shortAddress(r.address)} · ${r.chain ?? "Other"}` : "Legacy backup verification"}
              </p>
            </div>
            <div className="min-w-0 lg:w-48">
              <p className="truncate text-[13px] font-medium text-mist">{r.userName}</p>
              <p className="truncate text-xs text-fog">{r.userEmail}</p>
            </div>
            <div className="flex items-center justify-between gap-3 lg:w-auto lg:justify-end">
              <StatusBadge tone={statusTone(r.status)}>
                {r.status === "approved" ? "Protected" : r.status}
              </StatusBadge>
              {r.status === "pending" ? (
                <Button variant="outline" onClick={() => onReview(r)}>
                  Review
                </Button>
              ) : (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-fog/60">
                  <Clock className="h-3 w-3" /> {r.reviewedAt ? fmtDate(r.reviewedAt) : fmtDate(r.createdAt)}
                </span>
              )}
              <Button variant="danger" onClick={() => onDelete(r)}><Trash2 className="h-4 w-4" /><span className="hidden sm:inline">Delete</span></Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
