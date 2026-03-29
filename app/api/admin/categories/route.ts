import {
  adminCategoryCreateSchema,
  adminCategoryStatusSchema,
  adminCategoryUpdateSchema
} from "@/lib/admin-schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  parseAdminBody,
  requireAdminSession
} from "@/lib/server/admin-route";
import {
  createAdminCategory,
  listAdminCategories,
  setAdminCategoryStatus,
  updateAdminCategory
} from "@/services/admin-server-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    return createSuccessResponse(await listAdminCategories());
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminCategoryCreateSchema);
    return createSuccessResponse(await createAdminCategory(input, actor), { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminCategoryUpdateSchema);
    return createSuccessResponse(await updateAdminCategory(input, actor));
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminCategoryStatusSchema);
    return createSuccessResponse(await setAdminCategoryStatus(input, actor));
  } catch (error) {
    return createErrorResponse(error);
  }
}
