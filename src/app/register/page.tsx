import { redirect } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { getAppName } from "@/lib/site-settings";

export async function generateMetadata() { return { title: `Create account — ${await getAppName()}` }; }
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <AuthShell
      headline="Create your secured account."
      sub="One place to organise wallet review requests and learn to recognise wallet flashing, fake balances, phishing and other crypto scams."
    >
      <RegisterForm />
    </AuthShell>
  );
}
