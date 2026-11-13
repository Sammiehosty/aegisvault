import "server-only";

const API_BASE = "http://pinetnow.com/api";

export async function apiRequest<T = Record<string, unknown>>(
  path: string,
  options: { method?: "GET" | "POST"; token?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
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
