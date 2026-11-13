"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Globe,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Modal, Button, Field, Textarea, cx } from "@/components/ui";
import { WALLET_TYPES, detectChain, shortAddress, type WalletType } from "@/lib/wallets";
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
  const [address, setAddress] = useState("");
  const [pending, start] = useTransition();

  const chain = detectChain(address.trim());

  function reset() {
    setStep(0);
    setWallet(null);
    setAddress("");
  }

  function submit() {
    if (!wallet) return;
    start(async () => {
      try {
        const res = await submitBackupRequest({ walletType: wallet.id, address });
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success("Backup protection request submitted — pending review.");
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
      title="Backup verification"
      wide={step === 0}
    >
      <div className="mb-6 flex items-center gap-2">
        {["Wallet", "Address", "Protect"].map((s, i) => (
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
            <div className={cx("h-px flex-1", i < 2 ? (i < step ? "bg-aegis/50" : "bg-line-strong") : "hidden")} />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" {...stepAnim}>
            <p className="mb-4 text-[13px] text-fog">
              Select the wallet whose backup you want to protect with AegisVault:
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {WALLET_TYPES.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setWallet(w);
                    setStep(1);
                  }}
                  className={cx(
                    "group flex flex-col items-start gap-2 rounded-xl border border-line bg-white/[0.02] p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-aegis/40 hover:bg-aegis/[0.05]",
                    wallet?.id === w.id && "border-aegis/50 bg-aegis/[0.07]",
                  )}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white/[0.04]"
                    style={{ color: w.accent }}
                  >
                    <Wallet className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-white">{w.name}</span>
                    <span className="block text-[10px] text-fog">{w.chain}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && wallet && (
          <motion.div key="s1" {...stepAnim} className="space-y-4">
            <button
              onClick={() => setStep(0)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-fog transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {wallet.name} selected — change
            </button>

            <Field label="Public wallet address">
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Paste your public wallet address here"
                className="mono min-h-28 resize-y break-all text-[13px]"
                rows={4}
                autoFocus
                spellCheck={false}
              />
            </Field>

            {address.trim().length > 8 && (
              <div
                className={cx(
                  "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs",
                  chain === "Other"
                    ? "border-amber-warn/35 bg-amber-warn/[0.08] text-amber-warn"
                    : chain
                      ? "border-aegis/30 bg-aegis/[0.06] text-aegis"
                      : "border-danger/30 bg-danger/[0.06] text-danger",
                )}
              >
                {chain === "Other" ? (
                  <>
                    <ShieldAlert className="h-4 w-4" /> Your wallet is not protected.
                  </>
                ) : chain ? (
                  <>
                    <BadgeCheck className="h-4 w-4" /> Valid {chain} address detected
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" /> Not a recognised public address format
                  </>
                )}
              </div>
            )}

            <Button className="w-full py-3" disabled={!chain} onClick={() => setStep(2)}>
              Continue to Protect
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && wallet && (
          <motion.div key="s2" {...stepAnim} className="space-y-4">
            <div className="rounded-2xl border border-line bg-white/[0.02] p-5">
              <p className="mb-4 font-display text-xs font-bold uppercase tracking-[0.16em] text-fog">
                Backup protection summary
              </p>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-fog">Wallet</dt>
                  <dd className="font-semibold text-white">{wallet.name}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-fog">Network</dt>
                  <dd className="inline-flex items-center gap-1.5 font-semibold text-white">
                    <Globe className="h-3.5 w-3.5 text-aegis" />
                    {chain}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-fog">Address</dt>
                  <dd className="mono text-[13px] font-semibold text-aegis">{shortAddress(address.trim())}</dd>
                </div>
              </dl>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-line bg-white/[0.02] px-4 py-3.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-aegis" />
              <p className="text-xs leading-relaxed text-fog">
                Protect your wallet backup with AegisVault to help guard against crypto scams,
                fraudulent activity, and other crypto-related threats. Submit your public wallet
                address for protection review to get started.
              </p>
            </div>

            <div className="flex gap-2.5">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 py-3">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={submit} loading={pending} className="flex-[2] py-3">
                Protect
                <ShieldCheck className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
