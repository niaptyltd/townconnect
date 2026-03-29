import { adminBusinessActionSchema } from "@/lib/admin-schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  parseAdminBody,
  requireAdminSession
} from "@/lib/server/admin-route";
import {
  listAdminBusinesses,
  mutateAdminBusiness
} from "@/services/admin-server-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    return createSuccessResponse(await listAdminBusinesses());
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminBusinessActionSchema);
    return createSuccessResponse(await mutateAdminBusiness(input, actor));
  } catch (error) {
    return createErrorResponse(error);
  }
}
