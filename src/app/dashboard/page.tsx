import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getCurrentUser, getSessionToken } from "@/lib/auth";
import DashboardClient from "@/components/dashboard-client";

export const metadata = { title: "Dashboard — AegisVault" };
export const dynamic = "force-dynamic";

type DashboardPayload = {
  ok: true;
  wallets: Array<{ id: string; userId: string; walletType: string; label: string | null; address: string; chain: string; status: "pending" | "approved" | "rejected"; reviewNote: string | null; reviewedBy: string | null; reviewedAt: string | null; createdAt: string }>;
  backups: Array<{ id: string; userId: string; method: "paper" | "steel" | "hardware" | "shamir"; walletType: string; checklist: Record<string, boolean>; status: "pending" | "approved" | "rejected"; reviewNote: string | null; reviewedBy: string | null; reviewedAt: string | null; createdAt: string }>;
  activity: Array<{ id: string; userId: string; kind: string; message: string; isAdminVisible: boolean; createdAt: string }>;
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");
  if (user.role === "admin") return redirect("/admin");
  const token = await getSessionToken();
  if (!token) return redirect("/login");
  let data: DashboardPayload;
  try { data = await apiRequest<DashboardPayload>("/dashboard", { token }); }
  catch { return redirect("/login"); }

  const walletApproved = data.wallets.some((w) => w.status === "approved");
  const walletPending = data.wallets.some((w) => w.status === "pending");
  const backupApproved = data.backups.some((b) => b.status === "approved");
  const backupPending = data.backups.some((b) => b.status === "pending");
  const score = Math.min(100, 25 + (walletApproved ? 38 : walletPending ? 10 : 0) + (backupApproved ? 37 : backupPending ? 10 : 0));

  return <DashboardClient user={{ fullName: user.fullName, email: user.email }} wallets={data.wallets} backups={data.backups} activity={data.activity} score={score} />;
}
