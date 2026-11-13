"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/lib/auth";

type ActionResult = { ok: true; redirect?: string } | { ok: false; error: string };
type AuthResponse = { ok: true; token: string; user: { role: "user" | "admin" } };

function failure(error: unknown): ActionResult {
  return { ok: false, error: error instanceof Error ? error.message : "The API request failed. Please try again." };
}

export async function registerAction(input: { fullName: string; email: string; password: string }): Promise<ActionResult> {
  try {
    const result = await apiRequest<AuthResponse>("/auth/register", { method: "POST", body: input });
    await setSessionToken(result.token);
    revalidatePath("/dashboard");
    return { ok: true, redirect: "/dashboard" };
  } catch (error) { return failure(error); }
}

export async function loginAction(input: { email: string; password: string }): Promise<ActionResult> {
  try {
    const result = await apiRequest<AuthResponse>("/auth/login", { method: "POST", body: input });
    await setSessionToken(result.token);
    return { ok: true, redirect: result.user.role === "admin" ? "/admin" : "/dashboard" };
  } catch (error) { return failure(error); }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    const token = await getSessionToken();
    if (token) await apiRequest("/auth/logout", { method: "POST", token, body: {} });
    await clearSessionToken();
    return { ok: true, redirect: "/" };
  } catch (error) {
    await clearSessionToken();
    return failure(error);
  }
}

export async function submitWalletRequest(input: { walletType: string; address: string; label?: string }): Promise<ActionResult> {
  try {
    const token = await getSessionToken();
    if (!token) return { ok: false, error: "Your session has expired. Please sign in again." };
    await apiRequest("/wallet-requests", { method: "POST", token, body: input });
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) { return failure(error); }
}

export async function submitBackupRequest(input: { walletType: string; method: string; checklist: Record<string, boolean> }): Promise<ActionResult> {
  try {
    const token = await getSessionToken();
    if (!token) return { ok: false, error: "Your session has expired. Please sign in again." };
    await apiRequest("/backup-requests", { method: "POST", token, body: input });
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) { return failure(error); }
}

export async function reviewWalletRequest(input: { requestId: string; decision: "approved" | "rejected"; note?: string }): Promise<ActionResult> {
  try {
    const token = await getSessionToken();
    if (!token) return { ok: false, error: "Admin access required." };
    await apiRequest("/wallet-requests/review", { method: "POST", token, body: input });
    revalidatePath("/admin"); revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) { return failure(error); }
}

export async function reviewBackupRequest(input: { requestId: string; decision: "approved" | "rejected"; note?: string }): Promise<ActionResult> {
  try {
    const token = await getSessionToken();
    if (!token) return { ok: false, error: "Admin access required." };
    await apiRequest("/backup-requests/review", { method: "POST", token, body: input });
    revalidatePath("/admin"); revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) { return failure(error); }
}
