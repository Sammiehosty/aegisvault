import "server-only";

import { apiRequest } from "@/lib/api";

export async function getAppName(): Promise<string> {
  try {
    const result = await apiRequest<{ ok: true; appName?: string }>("/settings");
    return result.appName?.trim() || "AegisVault";
  } catch {
    return "AegisVault";
  }
}
