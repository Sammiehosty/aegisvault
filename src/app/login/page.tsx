import { redirect } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign in — AegisVault" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <AuthShell
      headline="Welcome back."
      sub="Sign in to review your wallet protection requests and scam-safety resources."
    >
      <LoginForm />
    </AuthShell>
  );
}
