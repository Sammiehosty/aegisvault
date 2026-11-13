"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Check, ClipboardCheck, Database, ShieldCheck, Wallet } from "lucide-react";
import { Modal, Button, cx } from "@/components/ui";
import { BACKUP_CHECKLIST, BACKUP_METHODS, WALLET_TYPES, type WalletType } from "@/lib/wallets";
import { submitBackupRequest } from "@/lib/actions";

const stepAnim = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export function BackupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [pending, start] = useTransition();

  const confirmedCount = BACKUP_CHECKLIST.filter((c) => checked[c.id]).length;

  function reset() {
    setStep(0);
    setWallet(null);
    setMethod(null);
    setChecked({});
  }

  function submit() {
    if (!wallet || !method) return;
    start(async () => {
      try {
        const checklist: Record<string, boolean> = {};
        for (const c of BACKUP_CHECKLIST) checklist[c.id] = Boolean(checked[c.id]);
        const res = await submitBackupRequest({ walletType: wallet.id, method, checklist });
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success("Backup verification submitted — pending review.");
        onClose();
        reset();
        router.refresh();
      } catch {
        toast.error("Network hiccup reaching the server — please retry.");
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setTimeout(reset, 250);
      }}
      title="Verify wallet backup"
      wide={step === 1}
    >
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-glow/25 bg-glow/[0.06] px-4 py-3.5">
        <Database className="mt-0.5 h-4.5 w-4.5 shrink-0 text-glow" />
        <p className="text-xs leading-relaxed text-mist">
          This is a <span className="font-semibold text-white">backup health attestation</span> — you
          confirm safe storage practices, an analyst reviews your submission, and your backup status
          upgrades to <span className="font-semibold text-aegis">Protected</span>. You never type,
          paste or upload your recovery phrase anywhere in this flow.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-2">
        {["Setup", "Checklist"].map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cx(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors",
                i <= step
                  ? "border-aegis/50 bg-aegis/15 text-aegis"
                  : "border-line-strong bg-white/[0.03] text-fog",
              )}
            >
              {i + 1}
            </span>
            <span className={cx("text-[11px] font-semibold", i <= step ? "text-white" : "text-fog/60")}>
              {s}
            </span>
            <div className={cx("h-px flex-1", i < 1 ? (i < step ? "bg-aegis/50" : "bg-line-strong") : "hidden")} />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="b0" {...stepAnim} className="space-y-5">
            <div>
              <p className="mb-2.5 text-[13px] font-medium text-mist">Which wallet does this backup protect?</p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {WALLET_TYPES.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWallet(w)}
                    className={cx(
                      "flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-all duration-300",
                      wallet?.id === w.id
                        ? "border-aegis/50 bg-aegis/[0.08]"
                        : "border-line bg-white/[0.02] hover:border-aegis/30",
                    )}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white/[0.04]"
                      style={{ color: w.accent }}
                    >
                      <Wallet className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-semibold text-white">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-[13px] font-medium text-mist">How is the recovery phrase backed up?</p>
              <div className="space-y-2">
                {BACKUP_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={cx(
                      "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300",
                      method === m.id
                        ? "border-aegis/50 bg-aegis/[0.08]"
                        : "border-line bg-white/[0.02] hover:border-aegis/30",
                    )}
                  >
                    <span
                      className={cx(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        method === m.id ? "border-aegis bg-aegis text-[#04120c]" : "border-line-strong",
                      )}
                    >
                      {method === m.id && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-white">{m.label}</span>
                      <span className="block text-[11.5px] text-fog">{m.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full py-3" disabled={!wallet || !method} onClick={() => setStep(1)}>
              Continue to security checklist
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="b1" {...stepAnim} className="space-y-5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-fog transition hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to setup
              </button>
              <span
                className={cx(
                  "rounded-full border px-3 py-1 text-[11px] font-bold",
                  confirmedCount >= 5
                    ? "border-aegis/40 bg-aegis/10 text-aegis"
                    : "border-amber-warn/40 bg-amber-warn/10 text-amber-warn",
                )}
              >
                {confirmedCount}/6 confirmed
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {BACKUP_CHECKLIST.map((item) => {
                const active = Boolean(checked[item.id]);
                return (
                  <button
                    key={item.id}
                    onClick={() => setChecked((c) => ({ ...c, [item.id]: !c[item.id] }))}
                    className={cx(
                      "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300",
                      active
                        ? "border-aegis/45 bg-aegis/[0.08]"
                        : "border-line bg-white/[0.02] hover:border-aegis/25",
                    )}
                  >
                    <span
                      className={cx(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        active ? "border-aegis bg-aegis text-[#04120c]" : "border-line-strong",
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold leading-snug text-white">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-fog">{item.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-line bg-white/[0.02] px-4 py-3.5">
              <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-aegis" />
              <p className="text-xs leading-relaxed text-fog">
                Confirm at least <span className="font-semibold text-white">5 of 6</span> practices to
                request verification. Your submission goes{" "}
                <span className="font-semibold text-amber-warn">Pending</span>; after analyst approval
                your backup is marked <span className="font-semibold text-aegis">Protected</span> and
                your Security Score rises.
              </p>
            </div>

            <Button
              className="w-full py-3"
              disabled={confirmedCount < 5}
              loading={pending}
              onClick={submit}
            >
              Submit backup verification
              <ShieldCheck className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
