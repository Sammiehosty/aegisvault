import "server-only";

const API_BASE = "http://pinetnow.com/api";

export async function apiRequest<T = Record<string, unknown>>(
  path: string,
  options: { method?: "GET" | "POST"; token?: string; body?: unknown } = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const response = await fetch(`${API_BASE}${path}`, {
    method,
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
    const message = result.error || "The API returned an unexpected response.";
    // Include safe request metadata so a production error identifies the
    // exact endpoint and HTTP status without exposing credentials or tokens.
    throw new Error(`${message} (HTTP ${response.status}; ${method} ${path})`);
  }
  return result;
}
