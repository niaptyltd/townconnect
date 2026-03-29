import { randomUUID } from "crypto";

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
import { AdminRouteError, writeAdminActivity } from "@/lib/server/admin-route";
import {
  getServerDocumentById,
  listServerDocuments,
  saveServerDocument
} from "@/lib/server/collection-store";
import {
  canAdminFeatureBusiness,
  canAdminSponsorBusiness,
  enforceBusinessSave
} from "@/services/commercial-service";
import type {
  ActivityLog,
  Banner,
  Business,
  Category,
  Plan,
  PlatformSettings,
  SessionUser,
  Subscription,
  Town,
  UserProfile
} from "@/types";
import { getCommercialStateForBusiness } from "@/utils/plan";
import { slugify } from "@/utils/slug";

function sortByNewest<T extends { createdAt?: string; updatedAt?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftValue = left.updatedAt ?? left.createdAt ?? "";
    const rightValue = right.updatedAt ?? right.createdAt ?? "";
    return rightValue.localeCompare(leftValue);
  });
}

function mapSubscriptionStatusToBusinessStatus(status: Subscription["status"]) {
  return status === "cancelled" ? "expired" : status;
}

function withUpdatedAt<T extends { updatedAt: string }>(document: T, updatedAt: string): T {
  return {
    ...document,
    updatedAt
  };
}

function documentsMatch(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function getPlatformSettingsOrThrow() {
  const settings = await listServerDocuments<PlatformSettings>("platform_settings");
  const current = settings[0];

  if (!current) {
    throw new AdminRouteError(
      500,
      "SETTINGS_MISSING",
      "Platform settings must exist before admin mutations can run."
    );
  }

  return current;
}

async function getPlansOrThrow() {
  const plans = await listServerDocuments<Plan>("plans");
  if (!plans.length) {
    throw new AdminRouteError(
      500,
      "PLANS_MISSING",
      "At least one pricing plan must exist before admin mutations can run."
    );
  }

  return plans;
}

async function getBusinessOrThrow(businessId: string) {
  const business = await getServerDocumentById<Business>("businesses", businessId);
  if (!business) {
    throw new AdminRouteError(404, "BUSINESS_NOT_FOUND", "The selected business could not be found.");
  }
  return business;
}

async function getUserOrThrow(userId: string) {
  const user = await getServerDocumentById<UserProfile>("users", userId);
  if (!user) {
    throw new AdminRouteError(404, "USER_NOT_FOUND", "The selected user could not be found.");
  }
  return user;
}

async function getTownOrThrow(townId: string) {
  const town = await getServerDocumentById<Town>("towns", townId);
  if (!town) {
    throw new AdminRouteError(404, "TOWN_NOT_FOUND", "The selected town could not be found.");
  }
  return town;
}

async function getCategoryOrThrow(categoryId: string) {
  const category = await getServerDocumentById<Category>("categories", categoryId);
  if (!category) {
    throw new AdminRouteError(
      404,
      "CATEGORY_NOT_FOUND",
      "The selected category could not be found."
    );
  }
  return category;
}

async function assertUniqueSlug(
  collectionName: "towns" | "categories",
  slug: string,
  excludeId?: string
) {
  const items =
    collectionName === "towns"
      ? await listServerDocuments<Town>("towns")
      : await listServerDocuments<Category>("categories");

  if (items.some((item) => item.slug === slug && item.id !== excludeId)) {
    throw new AdminRouteError(
      400,
      "DUPLICATE_SLUG",
      "Another record already uses this slug. Choose a more specific name."
    );
  }
}

async function assertTownCanDeactivate(townId: string) {
  const businesses = await listServerDocuments<Business>("businesses");
  const activeBusinessCount = businesses.filter(
    (business) => business.townId === townId && business.listingStatus === "active"
  ).length;

  if (activeBusinessCount > 0) {
    throw new AdminRouteError(
      400,
      "TOWN_IN_USE",
      "Deactivate or move active businesses before disabling this town."
    );
  }
}

async function assertCategoryCanDeactivate(categoryId: string) {
  const businesses = await listServerDocuments<Business>("businesses");
  const activeBusinessCount = businesses.filter(
    (business) => business.categoryId === categoryId && business.listingStatus === "active"
  ).length;

  if (activeBusinessCount > 0) {
    throw new AdminRouteError(
      400,
      "CATEGORY_IN_USE",
      "Deactivate or recategorize active businesses before disabling this category."
    );
  }
}

async function reconcileBusinesses(plans: Plan[], settings: PlatformSettings, businessIds?: string[]) {
  const businesses = businessIds?.length
    ? (
        await Promise.all(
          businessIds.map((businessId) => getServerDocumentById<Business>("businesses", businessId))
        )
      ).filter(Boolean) as Business[]
    : await listServerDocuments<Business>("businesses");

  const updatedAt = new Date().toISOString();

  await Promise.all(
    businesses.map(async (business) => {
      const reconciled = withUpdatedAt(
        enforceBusinessSave(business, plans, settings),
        updatedAt
      );

      if (!documentsMatch(reconciled, business)) {
        await saveServerDocument("businesses", reconciled);
      }
    })
  );
}

async function syncBannerCreditsUsed(
  businessIds: string[],
  plans: Plan[],
  settings: PlatformSettings
) {
  const uniqueBusinessIds = Array.from(new Set(businessIds.filter(Boolean)));
  if (!uniqueBusinessIds.length) return;

  const [businesses, banners] = await Promise.all([
    Promise.all(
      uniqueBusinessIds.map((businessId) => getServerDocumentById<Business>("businesses", businessId))
    ),
    listServerDocuments<Banner>("banners")
  ]);
  const existingBusinesses = businesses.filter((business): business is Business => Boolean(business));

  const updatedAt = new Date().toISOString();

  await Promise.all(
    existingBusinesses.map(async (business) => {
      const activeBannerCount = banners.filter(
        (banner) => banner.sponsorBusinessId === business.id && banner.isActive
      ).length;

      const reconciled = withUpdatedAt(
        enforceBusinessSave(
          {
            ...business,
            bannerCreditsUsed: activeBannerCount
          },
          plans,
          settings
        ),
        updatedAt
      );

      if (!documentsMatch(reconciled, business)) {
        await saveServerDocument("businesses", reconciled);
      }
    })
  );
}

async function disableSponsoredBannersForBusiness(
  businessId: string,
  plans: Plan[],
  settings: PlatformSettings
) {
  const banners = await listServerDocuments<Banner>("banners");
  const affected = banners.filter(
    (banner) => banner.sponsorBusinessId === businessId && banner.isActive
  );

  if (!affected.length) return 0;

  const updatedAt = new Date().toISOString();
  await Promise.all(
    affected.map((banner) =>
      saveServerDocument("banners", {
        ...banner,
        isActive: false,
        updatedAt
      })
    )
  );

  await syncBannerCreditsUsed([businessId], plans, settings);
  return affected.length;
}

async function reconcileSponsoredBanners(plans: Plan[], settings: PlatformSettings) {
  const [banners, businesses] = await Promise.all([
    listServerDocuments<Banner>("banners"),
    listServerDocuments<Business>("businesses")
  ]);

  const businessMap = new Map(businesses.map((business) => [business.id, business]));
  const activeCreditsByBusiness = new Map<string, number>();
  const touchedBusinessIds = new Set<string>();
  const updatedAt = new Date().toISOString();

  for (const banner of [...banners].sort((left, right) => {
    const priorityGap = (right.priority ?? 0) - (left.priority ?? 0);
    if (priorityGap !== 0) return priorityGap;
    return right.createdAt.localeCompare(left.createdAt);
  })) {
    if (
      banner.campaignType !== "sponsored_business" ||
      !banner.sponsorBusinessId ||
      !banner.isActive
    ) {
      continue;
    }

    const business = businessMap.get(banner.sponsorBusinessId);
    const canRemainActive =
      !!business &&
      business.listingStatus === "active" &&
      canAdminSponsorBusiness(business, plans, settings);

    if (!business || !canRemainActive) {
      touchedBusinessIds.add(banner.sponsorBusinessId);
      await saveServerDocument("banners", {
        ...banner,
        isActive: false,
        updatedAt
      });
      continue;
    }

    const state = getCommercialStateForBusiness(business, plans, settings);
    const activeCredits = activeCreditsByBusiness.get(business.id) ?? 0;

    if (activeCredits >= state.config.bannerCredits) {
      touchedBusinessIds.add(business.id);
      await saveServerDocument("banners", {
        ...banner,
        isActive: false,
        updatedAt
      });
      continue;
    }

    activeCreditsByBusiness.set(business.id, activeCredits + 1);
    touchedBusinessIds.add(business.id);
  }

  await syncBannerCreditsUsed(Array.from(touchedBusinessIds), plans, settings);
}

async function assertBannerRelationships(
  input: Pick<Banner, "townId" | "categoryId" | "sponsorBusinessId">
) {
  const checks: Promise<Town | Category | Business | null>[] = [];

  if (input.townId) {
    checks.push(getServerDocumentById<Town>("towns", input.townId));
  }

  if (input.categoryId) {
    checks.push(getServerDocumentById<Category>("categories", input.categoryId));
  }

  if (input.sponsorBusinessId) {
    checks.push(getServerDocumentById<Business>("businesses", input.sponsorBusinessId));
  }

  const results = await Promise.all(checks);
  if (results.some((item) => !item)) {
    throw new AdminRouteError(
      400,
      "INVALID_RELATIONSHIP",
      "One or more linked banner entities could not be found."
    );
  }
}

async function assertSponsoredBannerEligibility(nextBanner: Banner, currentBannerId?: string) {
  if (!nextBanner.sponsorBusinessId) return;

  const [business, banners, plans, settings] = await Promise.all([
    getBusinessOrThrow(nextBanner.sponsorBusinessId),
    listServerDocuments<Banner>("banners"),
    getPlansOrThrow(),
    getPlatformSettingsOrThrow()
  ]);

  if (business.listingStatus !== "active") {
    throw new AdminRouteError(
      400,
      "BUSINESS_INACTIVE",
      "Only active businesses can run sponsored banner placements."
    );
  }

  if (!canAdminSponsorBusiness(business, plans, settings)) {
    throw new AdminRouteError(
      400,
      "SPONSORED_NOT_ALLOWED",
      "This business is not currently eligible for sponsored placements."
    );
  }

  if (!nextBanner.isActive) return;

  const state = getCommercialStateForBusiness(business, plans, settings);
  const activeCount = banners.filter(
    (banner) =>
      banner.id !== currentBannerId &&
      banner.sponsorBusinessId === business.id &&
      banner.isActive
  ).length;

  if (activeCount >= state.config.bannerCredits) {
    throw new AdminRouteError(
      400,
      "BANNER_CREDIT_LIMIT",
      `This business only has ${state.config.bannerCredits} active banner slot(s) on its current plan.`
    );
  }
}

export async function listAdminBusinesses() {
  return sortByNewest(await listServerDocuments<Business>("businesses"));
}

export async function listAdminUsers() {
  return sortByNewest(await listServerDocuments<UserProfile>("users"));
}

export async function listAdminPlans() {
  return [...(await listServerDocuments<Plan>("plans"))].sort(
    (left, right) => left.sortOrder - right.sortOrder
  );
}

export async function listAdminBanners() {
  return [...(await listServerDocuments<Banner>("banners"))].sort((left, right) => {
    const priorityGap = (right.priority ?? 0) - (left.priority ?? 0);
    if (priorityGap !== 0) return priorityGap;
    return right.createdAt.localeCompare(left.createdAt);
  });
}

export async function listAdminTowns() {
  return [...(await listServerDocuments<Town>("towns"))].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

export async function listAdminCategories() {
  return [...(await listServerDocuments<Category>("categories"))].sort(
    (left, right) => left.sortOrder - right.sortOrder
  );
}

export async function listAdminSettings() {
  return listServerDocuments<PlatformSettings>("platform_settings");
}

export async function listAdminSubscriptions() {
  return sortByNewest(await listServerDocuments<Subscription>("subscriptions"));
}

export async function listAdminActivityLogs() {
  return sortByNewest(await listServerDocuments<ActivityLog>("activity_logs"));
}

export async function updateAdminUserStatus(input: AdminUserStatusInput, actor: SessionUser) {
  const [user, users] = await Promise.all([
    getUserOrThrow(input.id),
    listServerDocuments<UserProfile>("users")
  ]);

  if (!input.isActive && actor.id === user.id) {
    throw new AdminRouteError(
      400,
      "SELF_DEACTIVATION_BLOCKED",
      "Admins cannot deactivate their own account."
    );
  }

  if (!input.isActive && user.role === "admin") {
    const remainingActiveAdmins = users.filter(
      (candidate) => candidate.role === "admin" && candidate.isActive && candidate.id !== user.id
    );

    if (!remainingActiveAdmins.length) {
      throw new AdminRouteError(
        400,
        "LAST_ADMIN_BLOCKED",
        "At least one active admin account must remain on the platform."
      );
    }
  }

  const nextUser: UserProfile = {
    ...user,
    isActive: input.isActive,
    updatedAt: new Date().toISOString()
  };

  await saveServerDocument("users", nextUser);
  await writeAdminActivity({
    actor,
    entityType: "user",
    entityId: nextUser.id,
    action: input.isActive ? "user_activated" : "user_deactivated",
    metadata: {
      role: nextUser.role,
      email: nextUser.email
    }
  });

  return nextUser;
}

export async function createAdminTown(input: AdminTownCreateInput, actor: SessionUser) {
  const slug = slugify(input.name);
  await assertUniqueSlug("towns", slug);

  const now = new Date().toISOString();
  const town: Town = {
    id: `town_${randomUUID().slice(0, 8)}`,
    name: input.name,
    slug,
    province: input.province,
    country: input.country,
    isActive: true,
    heroImageUrl: input.heroImageUrl,
    createdAt: now,
    updatedAt: now
  };

  await saveServerDocument("towns", town);
  await writeAdminActivity({
    actor,
    entityType: "town",
    entityId: town.id,
    action: "town_created",
    metadata: {
      slug: town.slug,
      province: town.province,
      country: town.country
    }
  });

  return town;
}

export async function updateAdminTown(input: AdminTownUpdateInput, actor: SessionUser) {
  const existingTown = await getTownOrThrow(input.id);
  const slug = slugify(input.name);

  await assertUniqueSlug("towns", slug, existingTown.id);

  if (!input.isActive && existingTown.isActive) {
    await assertTownCanDeactivate(existingTown.id);
  }

  const nextTown: Town = {
    ...existingTown,
    name: input.name,
    slug,
    province: input.province,
    country: input.country,
    heroImageUrl: input.heroImageUrl,
    isActive: input.isActive,
    updatedAt: new Date().toISOString()
  };

  await saveServerDocument("towns", nextTown);
  await writeAdminActivity({
    actor,
    entityType: "town",
    entityId: nextTown.id,
    action: "town_updated",
    metadata: {
      slug: nextTown.slug,
      province: nextTown.province,
      isActive: nextTown.isActive
    }
  });

  return nextTown;
}

export async function setAdminTownStatus(input: AdminTownStatusInput, actor: SessionUser) {
  const existingTown = await getTownOrThrow(input.id);

  if (!input.isActive && existingTown.isActive) {
    await assertTownCanDeactivate(existingTown.id);
  }

  const nextTown: Town = {
    ...existingTown,
    isActive: input.isActive,
    updatedAt: new Date().toISOString()
  };

  await saveServerDocument("towns", nextTown);
  await writeAdminActivity({
    actor,
    entityType: "town",
    entityId: nextTown.id,
    action: input.isActive ? "town_enabled" : "town_disabled",
    metadata: {
      slug: nextTown.slug
    }
  });

  return nextTown;
}

export async function createAdminCategory(
  input: AdminCategoryCreateInput,
  actor: SessionUser
) {
  const slug = slugify(input.name);
  await assertUniqueSlug("categories", slug);

  const now = new Date().toISOString();
  const category: Category = {
    id: `category_${randomUUID().slice(0, 8)}`,
    name: input.name,
    slug,
    icon: input.icon,
    description: input.description,
    isActive: true,
    sortOrder: input.sortOrder,
    createdAt: now,
    updatedAt: now
  };

  await saveServerDocument("categories", category);
  await writeAdminActivity({
    actor,
    entityType: "category",
    entityId: category.id,
    action: "category_created",
    metadata: {
      slug: category.slug,
      sortOrder: category.sortOrder
    }
  });

  return category;
}

export async function updateAdminCategory(
  input: AdminCategoryUpdateInput,
  actor: SessionUser
) {
  const existingCategory = await getCategoryOrThrow(input.id);
  const slug = slugify(input.name);

  await assertUniqueSlug("categories", slug, existingCategory.id);

  if (!input.isActive && existingCategory.isActive) {
    await assertCategoryCanDeactivate(existingCategory.id);
  }

  const nextCategory: Category = {
    ...existingCategory,
    name: input.name,
    slug,
    icon: input.icon,
    description: input.description,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    updatedAt: new Date().toISOString()
  };

  await saveServerDocument("categories", nextCategory);
  await writeAdminActivity({
    actor,
    entityType: "category",
    entityId: nextCategory.id,
    action: "category_updated",
    metadata: {
      slug: nextCategory.slug,
      sortOrder: nextCategory.sortOrder,
      isActive: nextCategory.isActive
    }
  });

  return nextCategory;
}

export async function setAdminCategoryStatus(
  input: AdminCategoryStatusInput,
  actor: SessionUser
) {
  const existingCategory = await getCategoryOrThrow(input.id);

  if (!input.isActive && existingCategory.isActive) {
    await assertCategoryCanDeactivate(existingCategory.id);
  }

  const nextCategory: Category = {
    ...existingCategory,
    isActive: input.isActive,
    updatedAt: new Date().toISOString()
  };

  await saveServerDocument("categories", nextCategory);
  await writeAdminActivity({
    actor,
    entityType: "category",
    entityId: nextCategory.id,
    action: input.isActive ? "category_enabled" : "category_disabled",
    metadata: {
      slug: nextCategory.slug
    }
  });

  return nextCategory;
}

export async function updateAdminPlan(input: AdminPlanUpdateInput, actor: SessionUser) {
  const [existing, plans, settings] = await Promise.all([
    getServerDocumentById<Plan>("plans", input.id),
    getPlansOrThrow(),
    getPlatformSettingsOrThrow()
  ]);

  if (!existing) {
    throw new AdminRouteError(404, "PLAN_NOT_FOUND", "The selected plan could not be found.");
  }

  const updatedAt = new Date().toISOString();
  const nextPlan: Plan = {
    ...existing,
    name: input.name,
    slug: input.slug,
    price: input.slug === "free" ? 0 : input.price,
    billingCycle: input.billingCycle,
    features: input.features,
    description: input.description,
    highlightLabel: input.highlightLabel,
    ctaLabel: input.ctaLabel,
    recommended: input.recommended,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
    config: input.config,
    updatedAt
  };

  await saveServerDocument("plans", nextPlan);

  if (nextPlan.recommended) {
    await Promise.all(
      plans
        .filter((plan) => plan.id !== nextPlan.id && plan.recommended)
        .map((plan) =>
          saveServerDocument("plans", {
            ...plan,
            recommended: false,
            updatedAt
          })
        )
    );
  }

  const nextPlans = plans.map((plan) => {
    if (plan.id === nextPlan.id) return nextPlan;
    if (nextPlan.recommended && plan.recommended) {
      return {
        ...plan,
        recommended: false,
        updatedAt
      };
    }
    return plan;
  });

  await reconcileBusinesses(nextPlans, settings);
  await reconcileSponsoredBanners(nextPlans, settings);

  await writeAdminActivity({
    actor,
    entityType: "plan",
    entityId: nextPlan.id,
    action: "plan_updated",
    metadata: {
      slug: nextPlan.slug,
      price: nextPlan.price,
      billingCycle: nextPlan.billingCycle,
      isActive: nextPlan.isActive
    }
  });

  return nextPlan;
}

export async function createAdminBanner(input: AdminBannerCreateInput, actor: SessionUser) {
  await assertBannerRelationships(input);

  const now = new Date().toISOString();
  const banner: Banner = {
    id: `banner_${randomUUID().slice(0, 8)}`,
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl,
    linkUrl: input.linkUrl,
    placement: input.placement,
    ctaLabel: input.ctaLabel,
    campaignType: input.campaignType,
    sponsorBusinessId: input.sponsorBusinessId,
    townId: input.townId,
    categoryId: input.categoryId,
    priority: input.priority,
    isActive: input.isActive,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: now,
    updatedAt: now
  };

  await assertSponsoredBannerEligibility(banner);
  await saveServerDocument("banners", banner);

  if (banner.sponsorBusinessId) {
    const [plans, settings] = await Promise.all([getPlansOrThrow(), getPlatformSettingsOrThrow()]);
    await syncBannerCreditsUsed([banner.sponsorBusinessId], plans, settings);
  }

  await writeAdminActivity({
    actor,
    entityType: "banner",
    entityId: banner.id,
    action: "banner_created",
    metadata: {
      placement: banner.placement,
      campaignType: banner.campaignType ?? "promotion",
      isActive: banner.isActive
    }
  });

  return banner;
}

export async function updateAdminBanner(input: AdminBannerUpdateInput, actor: SessionUser) {
  const existing = await getServerDocumentById<Banner>("banners", input.id);
  if (!existing) {
    throw new AdminRouteError(404, "BANNER_NOT_FOUND", "The selected banner could not be found.");
  }

  await assertBannerRelationships(input);

  const nextBanner: Banner = {
    ...existing,
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl,
    linkUrl: input.linkUrl,
    placement: input.placement,
    ctaLabel: input.ctaLabel,
    campaignType: input.campaignType,
    sponsorBusinessId: input.sponsorBusinessId,
    townId: input.townId,
    categoryId: input.categoryId,
    priority: input.priority,
    isActive: input.isActive,
    startDate: input.startDate,
    endDate: input.endDate,
    updatedAt: new Date().toISOString()
  };

  await assertSponsoredBannerEligibility(nextBanner, existing.id);
  await saveServerDocument("banners", nextBanner);

  const [plans, settings] = await Promise.all([getPlansOrThrow(), getPlatformSettingsOrThrow()]);
  await syncBannerCreditsUsed(
    [existing.sponsorBusinessId ?? "", nextBanner.sponsorBusinessId ?? ""],
    plans,
    settings
  );

  await writeAdminActivity({
    actor,
    entityType: "banner",
    entityId: nextBanner.id,
    action: "banner_updated",
    metadata: {
      placement: nextBanner.placement,
      campaignType: nextBanner.campaignType ?? "promotion",
      isActive: nextBanner.isActive
    }
  });

  return nextBanner;
}

export async function setAdminBannerStatus(input: AdminBannerStatusInput, actor: SessionUser) {
  const existing = await getServerDocumentById<Banner>("banners", input.id);
  if (!existing) {
    throw new AdminRouteError(404, "BANNER_NOT_FOUND", "The selected banner could not be found.");
  }

  const nextBanner: Banner = {
    ...existing,
    isActive: input.isActive,
    updatedAt: new Date().toISOString()
  };

  await assertSponsoredBannerEligibility(nextBanner, existing.id);
  await saveServerDocument("banners", nextBanner);

  if (existing.sponsorBusinessId || nextBanner.sponsorBusinessId) {
    const [plans, settings] = await Promise.all([getPlansOrThrow(), getPlatformSettingsOrThrow()]);
    await syncBannerCreditsUsed(
      [existing.sponsorBusinessId ?? "", nextBanner.sponsorBusinessId ?? ""],
      plans,
      settings
    );
  }

  await writeAdminActivity({
    actor,
    entityType: "banner",
    entityId: nextBanner.id,
    action: input.isActive ? "banner_enabled" : "banner_disabled",
    metadata: {
      placement: nextBanner.placement,
      campaignType: nextBanner.campaignType ?? "promotion"
    }
  });

  return nextBanner;
}

export async function mutateAdminBusiness(input: AdminBusinessActionInput, actor: SessionUser) {
  const [business, plans, settings, allBusinesses] = await Promise.all([
    getBusinessOrThrow(input.businessId),
    getPlansOrThrow(),
    getPlatformSettingsOrThrow(),
    listServerDocuments<Business>("businesses")
  ]);

  const updatedAt = new Date().toISOString();
  let nextBusiness = business;
  let action: string = input.action;
  let disabledSponsoredBanners = 0;

  switch (input.action) {
    case "verify":
      nextBusiness = {
        ...business,
        verificationStatus: "verified",
        listingStatus: business.listingStatus === "draft" ? "active" : business.listingStatus,
        updatedAt
      };
      action = "business_verified";
      break;
    case "reject":
      nextBusiness = {
        ...business,
        verificationStatus: "rejected",
        listingStatus: "suspended",
        featured: false,
        featuredUntil: "",
        featuredApprovedBy: "",
        sponsoredStatus: "none",
        sponsoredPlacement: undefined,
        sponsoredUntil: "",
        priorityScore: 0,
        updatedAt
      };
      action = "business_rejected";
      break;
    case "set_listing_status":
      if (input.listingStatus === "active" && business.verificationStatus === "rejected") {
        throw new AdminRouteError(
          400,
          "REJECTED_BUSINESS",
          "Rejected businesses must be re-verified before they can be reactivated."
        );
      }

      nextBusiness = {
        ...business,
        listingStatus: input.listingStatus,
        ...(input.listingStatus !== "active"
          ? {
              featured: false,
              featuredUntil: "",
              featuredApprovedBy: "",
              sponsoredStatus: "none" as Business["sponsoredStatus"],
              sponsoredPlacement: undefined,
              sponsoredUntil: "",
              priorityScore: Math.max((business.priorityScore ?? 0) - 20, 0)
            }
          : {}),
        updatedAt
      };
      action = `business_${input.listingStatus}`;
      break;
    case "set_featured": {
      if (input.featured) {
        const currentFeaturedCount = allBusinesses.filter(
          (item) => item.id !== business.id && item.featured
        ).length;
        const limit = settings.featuredBusinessLimit ?? Number.POSITIVE_INFINITY;

        if (business.listingStatus !== "active") {
          throw new AdminRouteError(
            400,
            "BUSINESS_INACTIVE",
            "Only active businesses can be featured."
          );
        }

        if (!canAdminFeatureBusiness(business, plans, settings)) {
          throw new AdminRouteError(
            400,
            "FEATURE_NOT_ALLOWED",
            "This business is not currently eligible for featured placement."
          );
        }

        if (currentFeaturedCount >= limit) {
          throw new AdminRouteError(
            400,
            "FEATURE_LIMIT_REACHED",
            "The featured business limit has already been reached."
          );
        }
      }

      nextBusiness = {
        ...business,
        featured: input.featured,
        featuredApprovedBy: input.featured ? actor.id : "",
        featuredRequestedAt: input.featured
          ? business.featuredRequestedAt ?? updatedAt
          : business.featuredRequestedAt,
        featuredUntil: input.featured
          ? input.featuredUntil ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
          : "",
        priorityScore: input.featured
          ? Math.max(business.priorityScore ?? 0, 30)
          : Math.max((business.priorityScore ?? 0) - 20, 0),
        updatedAt
      };
      action = input.featured ? "business_featured" : "business_unfeatured";
      break;
    }
    case "set_sponsored": {
      if (input.sponsoredStatus === "active") {
        const currentSponsoredCount = allBusinesses.filter(
          (item) => item.id !== business.id && item.sponsoredStatus === "active"
        ).length;
        const limit = settings.sponsoredListingLimit ?? Number.POSITIVE_INFINITY;

        if (business.listingStatus !== "active") {
          throw new AdminRouteError(
            400,
            "BUSINESS_INACTIVE",
            "Only active businesses can be sponsored."
          );
        }

        if (!canAdminSponsorBusiness(business, plans, settings)) {
          throw new AdminRouteError(
            400,
            "SPONSORED_NOT_ALLOWED",
            "This business is not currently eligible for sponsored placement."
          );
        }

        if (currentSponsoredCount >= limit) {
          throw new AdminRouteError(
            400,
            "SPONSORED_LIMIT_REACHED",
            "The sponsored listing limit has already been reached."
          );
        }
      }

      nextBusiness = {
        ...business,
        sponsoredStatus: input.sponsoredStatus,
        sponsoredPlacement:
          input.sponsoredStatus === "active" ? input.sponsoredPlacement : undefined,
        sponsoredUntil:
          input.sponsoredStatus === "active"
            ? input.sponsoredUntil ??
              new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
            : "",
        priorityScore:
          input.sponsoredStatus === "active"
            ? Math.max(business.priorityScore ?? 0, 45)
            : Math.max((business.priorityScore ?? 0) - 15, 0),
        updatedAt
      };
      action =
        input.sponsoredStatus === "active"
          ? "business_sponsored"
          : "business_sponsorship_updated";
      break;
    }
  }

  nextBusiness = withUpdatedAt(enforceBusinessSave(nextBusiness, plans, settings), updatedAt);
  await saveServerDocument("businesses", nextBusiness);

  if (
    nextBusiness.listingStatus !== "active" ||
    nextBusiness.sponsoredStatus !== "active"
  ) {
    disabledSponsoredBanners = await disableSponsoredBannersForBusiness(
      nextBusiness.id,
      plans,
      settings
    );
  }

  await syncBannerCreditsUsed([nextBusiness.id], plans, settings);

  await writeAdminActivity({
    actor,
    entityType: "business",
    entityId: nextBusiness.id,
    action,
    metadata: {
      listingStatus: nextBusiness.listingStatus,
      verificationStatus: nextBusiness.verificationStatus,
      featured: nextBusiness.featured,
      sponsoredStatus: nextBusiness.sponsoredStatus ?? "none",
      disabledSponsoredBanners
    }
  });

  return nextBusiness;
}

export async function updateAdminPlatformSettings(
  input: AdminPlatformSettingsUpdateInput,
  actor: SessionUser
) {
  const [existing, plans] = await Promise.all([getPlatformSettingsOrThrow(), getPlansOrThrow()]);

  if (existing.id !== input.id) {
    throw new AdminRouteError(
      400,
      "SETTINGS_ID_MISMATCH",
      "The submitted settings record does not match the active platform settings."
    );
  }

  const nextSettings: PlatformSettings = {
    ...existing,
    currency: input.currency,
    contactEmail: input.contactEmail,
    whatsappSupport: input.whatsappSupport,
    featuredBusinessLimit: input.featuredBusinessLimit,
    sponsoredListingLimit: input.sponsoredListingLimit,
    allowSelfSignup: input.allowSelfSignup,
    allowFreePlan: input.allowFreePlan,
    allowSponsoredListings: input.allowSponsoredListings,
    leadFlowDefault: input.leadFlowDefault,
    supportedPaymentProviders: Array.from(new Set(input.supportedPaymentProviders)),
    featuredEligibilityRequiresVerification: input.featuredEligibilityRequiresVerification,
    referralProgramEnabled: input.referralProgramEnabled,
    agentCommissionEnabled: input.agentCommissionEnabled,
    updatedAt: new Date().toISOString()
  };

  await saveServerDocument("platform_settings", nextSettings);
  await reconcileBusinesses(plans, nextSettings);
  await reconcileSponsoredBanners(plans, nextSettings);

  await writeAdminActivity({
    actor,
    entityType: "platform_settings",
    entityId: nextSettings.id,
    action: "platform_settings_updated",
    metadata: {
      currency: nextSettings.currency,
      featuredBusinessLimit: nextSettings.featuredBusinessLimit,
      sponsoredListingLimit: nextSettings.sponsoredListingLimit ?? 0,
      allowSponsoredListings: nextSettings.allowSponsoredListings ?? false
    }
  });

  return nextSettings;
}

export async function updateAdminSubscription(
  input: AdminSubscriptionUpdateInput,
  actor: SessionUser
) {
  const [business, plans, settings, subscriptions] = await Promise.all([
    getBusinessOrThrow(input.businessId),
    getPlansOrThrow(),
    getPlatformSettingsOrThrow(),
    listServerDocuments<Subscription>("subscriptions")
  ]);

  const selectedPlan = plans.find((plan) => plan.id === input.planId);
  if (!selectedPlan) {
    throw new AdminRouteError(404, "PLAN_NOT_FOUND", "The selected plan could not be found.");
  }

  if (!selectedPlan.isActive && (input.status === "active" || input.status === "trial")) {
    throw new AdminRouteError(
      400,
      "PLAN_INACTIVE",
      "Inactive plans cannot be assigned to active subscriptions."
    );
  }

  const supportedProviders = settings.supportedPaymentProviders ?? ["placeholder"];
  if (
    input.providerSlug !== "placeholder" &&
    !supportedProviders.includes(input.providerSlug)
  ) {
    throw new AdminRouteError(
      400,
      "PROVIDER_UNSUPPORTED",
      "The selected payment provider is not enabled in platform settings."
    );
  }

  const existingSubscription =
    (input.subscriptionId
      ? subscriptions.find((subscription) => subscription.id === input.subscriptionId)
      : subscriptions.find((subscription) => subscription.businessId === input.businessId)) ?? null;

  if (existingSubscription && existingSubscription.businessId !== business.id) {
    throw new AdminRouteError(
      400,
      "SUBSCRIPTION_MISMATCH",
      "The selected subscription does not belong to this business."
    );
  }

  const updatedAt = new Date().toISOString();
  const nextSubscription: Subscription = {
    id:
      existingSubscription?.id ??
      input.subscriptionId ??
      `subscription_${randomUUID().slice(0, 8)}`,
    businessId: business.id,
    planId: selectedPlan.id,
    planName: selectedPlan.slug as Subscription["planName"],
    status: input.status,
    billingCycle: input.billingCycle,
    amount: selectedPlan.slug === "free" ? 0 : selectedPlan.price,
    currency: settings.currency,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    paymentProvider: input.providerSlug,
    paymentReference:
      existingSubscription?.paymentReference ?? `ADMIN-${Date.now().toString(36).toUpperCase()}`,
    createdAt: existingSubscription?.createdAt ?? updatedAt,
    updatedAt,
    providerSlug: input.providerSlug,
    paymentStatus: input.paymentStatus,
    paymentIntentId: existingSubscription?.paymentIntentId,
    agentId: existingSubscription?.agentId ?? business.agentId,
    referralCode: existingSubscription?.referralCode ?? business.referralCode
  };

  const reconciledBusiness = withUpdatedAt(
    enforceBusinessSave(
      {
        ...business,
        subscriptionPlanId: selectedPlan.id,
        subscriptionStatus: mapSubscriptionStatusToBusinessStatus(input.status),
        paymentProviderPreference: input.providerSlug
      },
      plans,
      settings
    ),
    updatedAt
  );

  await Promise.all([
    saveServerDocument("subscriptions", nextSubscription),
    saveServerDocument("businesses", reconciledBusiness)
  ]);
  await reconcileSponsoredBanners(plans, settings);

  await writeAdminActivity({
    actor,
    entityType: "subscription",
    entityId: nextSubscription.id,
    action: "subscription_updated",
    metadata: {
      businessId: business.id,
      planId: nextSubscription.planId,
      status: nextSubscription.status,
      billingCycle: nextSubscription.billingCycle
    }
  });

  return {
    subscription: nextSubscription,
    business: reconciledBusiness
  };
}
