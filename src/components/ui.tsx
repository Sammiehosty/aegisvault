"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* --------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "subtle";

export function Button({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-aegis/60 disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.98]";
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-aegis text-[#04120c] hover:bg-[#3cf5b4] shadow-[0_10px_36px_-10px_rgba(23,232,160,0.55)]",
    outline:
      "border border-line-strong bg-white/[0.02] text-mist hover:border-aegis/50 hover:text-white hover:bg-aegis/[0.06]",
    ghost: "text-fog hover:text-white hover:bg-white/[0.05]",
    subtle: "bg-white/[0.05] text-mist hover:bg-white/[0.09] hover:text-white border border-line",
    danger:
      "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 hover:border-danger/50",
  };

  return (
    <button className={cx(base, variants[variant], className)} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/* --------------------------------- Inputs --------------------------------- */

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "field-glow w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-fog/50 transition-all duration-300 focus:outline-none",
        className,
      )}
      {...rest}
    />
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        "field-glow w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-fog/50 transition-all duration-300 focus:outline-none",
        className,
      )}
      {...rest}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-mist">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-fog/70">{hint}</span>}
    </label>
  );
}

/* --------------------------------- Badge ---------------------------------- */

type BadgeTone = "pending" | "approved" | "rejected" | "neutral" | "info";

export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  const tones: Record<BadgeTone, string> = {
    pending: "border-amber-warn/30 bg-amber-warn/10 text-amber-warn",
    approved: "border-aegis/30 bg-aegis/10 text-aegis",
    rejected: "border-danger/30 bg-danger/10 text-danger",
    neutral: "border-line-strong bg-white/[0.04] text-fog",
    info: "border-glow/30 bg-glow/10 text-glow",
  };
  const dot: Record<BadgeTone, string> = {
    pending: "bg-amber-warn animate-pulse",
    approved: "bg-aegis",
    rejected: "bg-danger",
    neutral: "bg-fog",
    info: "bg-glow",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        tones[tone],
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", dot[tone])} />
      {children}
    </span>
  );
}

/* ---------------------------------- Card ---------------------------------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("glass rounded-2xl", className)}>{children}</div>;
}

/* ---------------------------------- Modal --------------------------------- */

export function Modal({
  open,
  onClose,
  children,
  title,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 42, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cx(
              "glass noise relative max-h-[88vh] w-full overflow-y-auto rounded-3xl p-6 sm:p-8 slim-scroll",
              wide ? "max-w-3xl" : "max-w-lg",
            )}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              {title && (
                <h3 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h3>
              )}
              <button
                onClick={onClose}
                className="ml-auto rounded-lg border border-line bg-white/[0.03] p-1.5 text-fog transition hover:bg-white/[0.08] hover:text-white"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ micro components --------------------------- */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-white/[0.03] text-aegis">
        {icon}
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-fog">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
