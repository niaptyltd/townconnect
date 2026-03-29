import { adminUserStatusSchema } from "@/lib/admin-schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  parseAdminBody,
  requireAdminSession
} from "@/lib/server/admin-route";
import {
  listAdminUsers,
  updateAdminUserStatus
} from "@/services/admin-server-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    return createSuccessResponse(await listAdminUsers());
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminUserStatusSchema);
    return createSuccessResponse(await updateAdminUserStatus(input, actor));
  } catch (error) {
    return createErrorResponse(error);
  }
}
