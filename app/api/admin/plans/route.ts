import { adminPlanUpdateSchema } from "@/lib/admin-schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  parseAdminBody,
  requireAdminSession
} from "@/lib/server/admin-route";
import { listAdminPlans, updateAdminPlan } from "@/services/admin-server-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    return createSuccessResponse(await listAdminPlans());
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminPlanUpdateSchema);
    return createSuccessResponse(await updateAdminPlan(input, actor));
  } catch (error) {
    return createErrorResponse(error);
  }
}
