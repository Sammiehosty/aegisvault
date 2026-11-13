import { apiRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await apiRequest<{ ok: true; service?: string }>("/health");
    return Response.json({ ok: true, backend: result.service ?? "aegisvault-api" });
  } catch {
    return Response.json({ ok: false, error: "Backend API unavailable or not configured." }, { status: 503 });
  }
}
