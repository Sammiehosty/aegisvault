import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api";

export const SESSION_COOKIE = "aegis_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
};

export async function getSessionToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value;
}

export async function setSessionToken(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionToken() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<ApiUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const result = await apiRequest<{ ok: true; user: ApiUser }>("/auth/me", { token });
    return result.user;
  } catch {
    return null;
  }
}
