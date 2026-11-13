import { redirect } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Create account — AegisVault" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <AuthShell
      headline="Create your secure account."
      sub="One account for wallet protection, backup verification and scam-awareness training. Under a minute to set up."
    >
      <RegisterForm />
    </AuthShell>
  );
}
