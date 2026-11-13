import { apiRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await apiRequest<{
      ok: true;
      service?: string;
      database?: string;
      authentication_schema?: string;
    }>("/health");
    return Response.json({
      ok: true,
      backend: result.service ?? "aegisvault-api",
      database: result.database ?? "connected",
      authenticationSchema: result.authentication_schema ?? "ready",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend API unavailable.";
    return Response.json({ ok: false, error: message }, { status: 503 });
  }
}
