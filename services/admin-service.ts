"use client";

import type {
  AdminBannerCreateInput,
  AdminBannerStatusInput,
  AdminBannerUpdateInput,
  AdminBusinessActionInput,
  AdminCategoryCreateInput,
  AdminCategoryStatusInput,
  AdminCategoryUpdateInput,
  AdminPlanUpdateInput,
  AdminPlatformSettingsUpdateInput,
  AdminSubscriptionUpdateInput,
  AdminTownCreateInput,
  AdminTownStatusInput,
  AdminTownUpdateInput,
  AdminUserStatusInput
} from "@/lib/admin-schemas";
import type {
  ActivityLog,
  Banner,
  Business,
  Category,
  Plan,
  PlatformSettings,
  Subscription,
  Town,
  UserProfile
} from "@/types";

interface AdminApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

interface AdminApiSuccess<T> {
  ok: true;
  data: T;
}

interface AdminApiFailure {
  ok: false;
  error: AdminApiErrorPayload;
}

type AdminApiResponse<T> = AdminApiSuccess<T> | AdminApiFailure;

async function requestAdmin<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const payload = (await response.json()) as AdminApiResponse<T>;

  if (!response.ok || !payload.ok) {
    if (typeof window !== "undefined") {
      if (response.status === 401) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.assign(`/login?reason=session_expired&next=${next}`);
      }

      if (response.status === 403) {
        window.location.assign("/forbidden");
      }
    }

    const message = payload.ok
      ? "Something went wrong while processing the admin request."
      : payload.error.message;
    throw new Error(message);
  }

  return payload.data;
}

export function listBusinesses() {
  return requestAdmin<Business[]>("/api/admin/businesses");
}

export function listUsers() {
  return requestAdmin<UserProfile[]>("/api/admin/users");
}

export function saveUserStatus(input: AdminUserStatusInput) {
  return requestAdmin<UserProfile>("/api/admin/users", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function mutateBusiness(input: AdminBusinessActionInput) {
  return requestAdmin<Business>("/api/admin/businesses", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function listPlans() {
  return requestAdmin<Plan[]>("/api/admin/plans");
}

export function savePlan(input: AdminPlanUpdateInput) {
  return requestAdmin<Plan>("/api/admin/plans", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function listBanners() {
  return requestAdmin<Banner[]>("/api/admin/banners");
}

export function listTowns() {
  return requestAdmin<Town[]>("/api/admin/towns");
}

export function createTown(input: AdminTownCreateInput) {
  return requestAdmin<Town>("/api/admin/towns", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function saveTown(input: AdminTownUpdateInput) {
  return requestAdmin<Town>("/api/admin/towns", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function setTownStatus(input: AdminTownStatusInput) {
  return requestAdmin<Town>("/api/admin/towns", {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export function listCategories() {
  return requestAdmin<Category[]>("/api/admin/categories");
}

export function createCategory(input: AdminCategoryCreateInput) {
  return requestAdmin<Category>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function saveCategory(input: AdminCategoryUpdateInput) {
  return requestAdmin<Category>("/api/admin/categories", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function setCategoryStatus(input: AdminCategoryStatusInput) {
  return requestAdmin<Category>("/api/admin/categories", {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export function createBanner(input: AdminBannerCreateInput) {
  return requestAdmin<Banner>("/api/admin/banners", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function saveBanner(input: AdminBannerUpdateInput) {
  return requestAdmin<Banner>("/api/admin/banners", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function setBannerStatus(input: AdminBannerStatusInput) {
  return requestAdmin<Banner>("/api/admin/banners", {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export function listSettings() {
  return requestAdmin<PlatformSettings[]>("/api/admin/settings");
}

export function saveSetting(input: AdminPlatformSettingsUpdateInput) {
  return requestAdmin<PlatformSettings>("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function listSubscriptions() {
  return requestAdmin<Subscription[]>("/api/admin/subscriptions");
}

export function saveSubscription(input: AdminSubscriptionUpdateInput) {
  return requestAdmin<{ subscription: Subscription; business: Business }>(
    "/api/admin/subscriptions",
    {
      method: "PATCH",
      body: JSON.stringify(input)
    }
  );
}

export function listActivityLogs() {
  return requestAdmin<ActivityLog[]>("/api/admin/activity");
}
