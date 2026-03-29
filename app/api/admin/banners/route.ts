import {
  adminBannerCreateSchema,
  adminBannerStatusSchema,
  adminBannerUpdateSchema
} from "@/lib/admin-schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  parseAdminBody,
  requireAdminSession
} from "@/lib/server/admin-route";
import {
  createAdminBanner,
  listAdminBanners,
  setAdminBannerStatus,
  updateAdminBanner
} from "@/services/admin-server-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    return createSuccessResponse(await listAdminBanners());
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminBannerCreateSchema);
    return createSuccessResponse(await createAdminBanner(input, actor), { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminBannerUpdateSchema);
    return createSuccessResponse(await updateAdminBanner(input, actor));
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const actor = await requireAdminSession();
    const input = await parseAdminBody(request, adminBannerStatusSchema);
    return createSuccessResponse(await setAdminBannerStatus(input, actor));
  } catch (error) {
    return createErrorResponse(error);
  }
}
