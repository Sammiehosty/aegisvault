import "server-only";

const API_BASE = process.env.AEGIS_API_URL?.replace(/\/$/, "");
const API_SECRET = process.env.AEGIS_API_SECRET;

export async function apiRequest<T = Record<string, unknown>>(
  path: string,
  options: { method?: "GET" | "POST"; token?: string; body?: unknown } = {},
): Promise<T> {
  if (!API_BASE) throw new Error("AEGIS_API_URL is not configured on the server.");
  if (!API_SECRET || API_SECRET.length < 32) throw new Error("AEGIS_API_SECRET is not configured correctly.");

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Aegis-Server-Key": API_SECRET,
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  const result = (await response.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
  if (!response.ok || result.ok === false) {
    throw new Error(result.error || `API request failed (${response.status}).`);
  }
  return result;
}
