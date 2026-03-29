import {
  createErrorResponse,
  createSuccessResponse,
  requireAdminSession
} from "@/lib/server/admin-route";
import { listAdminActivityLogs } from "@/services/admin-server-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    return createSuccessResponse(await listAdminActivityLogs());
  } catch (error) {
    return createErrorResponse(error);
  }
}
