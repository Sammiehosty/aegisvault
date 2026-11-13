import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getCurrentUser, getSessionToken, type ApiUser } from "@/lib/auth";
import AdminClient, { type ActivityRow, type BackupRow, type WalletRow } from "@/components/admin-client";

export const metadata = { title: "Admin console — AegisVault" };
export const dynamic = "force-dynamic";

type AdminPayload = {
  ok: true;
  admin: ApiUser;
  appName?: string;
  users: Array<{ id: string; fullName: string; email: string; role: "user" | "admin"; createdAt: string }>;
  walletRows: WalletRow[];
  backupRows: BackupRow[];
  activity: ActivityRow[];
};

export default async function AdminPage() {
  const admin = await getCurrentUser();
  if (!admin) return redirect("/login");
  if (admin.role !== "admin") return redirect("/dashboard");
  const token = await getSessionToken();
  if (!token) return redirect("/login");
  let data: AdminPayload;
  try { data = await apiRequest<AdminPayload>("/admin", { token }); }
  catch { return redirect("/login"); }

  return <AdminClient admin={{ fullName: admin.fullName, email: admin.email }} appName={data.appName ?? "AegisVault"} users={data.users} walletRows={data.walletRows} backupRows={data.backupRows} activity={data.activity} />;
}
