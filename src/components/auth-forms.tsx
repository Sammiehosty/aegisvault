"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { establishSessionAction, loginAction } from "@/lib/actions";
import { Button, Field, Input } from "@/components/ui";

function PasswordField({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label}>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={label === "Password" ? "current-password" : "new-password"}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-fog/60 transition hover:text-white"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          try {
            const res = await loginAction({ email, password });
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            toast.success("Welcome back. Stay alert and stay in control.");
            router.push(res.redirect ?? "/dashboard");
            router.refresh();
          } catch {
            toast.error("Network hiccup reaching the server — please retry.");
          }
        });
      }}
    >
      <Field label="Email address">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>
      <PasswordField label="Password" value={password} onChange={setPassword} placeholder="••••••••" />

      <Button type="submit" loading={pending} className="w-full py-3">
        Sign in securely
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="pt-2 text-center text-[13px] text-fog">
        New to AegisVault?{" "}
        <Link href="/register" className="font-semibold text-aegis transition hover:text-[#3cf5b4]">
          Create your secured account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (password !== confirm) {
          toast.error("Passwords do not match.");
          return;
        }
        start(async () => {
          try {
            const response = await fetch("https://pinetnow.com/api/auth/register", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              cache: "no-store",
              body: JSON.stringify({ fullName, email, password }),
            });
            const result = await response.json().catch(() => ({})) as {
              ok?: boolean;
              token?: string;
              error?: string;
            };
            if (!response.ok || result.ok !== true || !result.token) {
              toast.error(result.error || ("Registration failed (HTTP " + response.status + ")."));
              return;
            }

            // Signup data goes directly to PHP. This action verifies the token
            // and stores it in the existing HttpOnly session cookie.
            const res = await establishSessionAction(result.token);
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            toast.success("Account created. Your scam-safety journey begins.");
            router.push(res.redirect ?? "/dashboard");
            router.refresh();
          } catch {
            toast.error("Network hiccup reaching the server — please retry.");
          }
        });
      }}
    >
      <Field label="Full name">
        <Input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Smith"
          autoComplete="name"
        />
      </Field>
      <Field label="Email address">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>
      <PasswordField label="Password" value={password} onChange={setPassword} placeholder="Minimum 8 characters" />
      <PasswordField label="Confirm password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" />

      <Button type="submit" loading={pending} className="w-full py-3">
        Create secure account
        <ArrowRight className="h-4 w-4" />
      </Button>

      

      <p className="pt-1 text-center text-[13px] text-fog">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-aegis transition hover:text-[#3cf5b4]">
          Sign in
        </Link>
      </p>
    </form>
  );
}
