import {
  adminTownCreateSchema,
  adminTownStatusSchema,
  adminTownUpdateSchema
} from "@/lib/admin-schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  parseAdminBody,
  requireAdminSession
} from "@/lib/server/admin-route";
import {
  createAdminTown,
  listAdminTowns,
  setAdminTownStatus,
  updateAdminTown
} from "@/services/admin-server-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    return createSuccessResponse(await listAdminTowns());
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminTownCreateSchema);
    return createSuccessResponse(await createAdminTown(input, actor), { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminTownUpdateSchema);
    return createSuccessResponse(await updateAdminTown(input, actor));
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminTownStatusSchema);
    return createSuccessResponse(await setAdminTownStatus(input, actor));
  } catch (error) {
    return createErrorResponse(error);
  }
}
