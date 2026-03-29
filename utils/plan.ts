import { planDefinitions } from "@/constants/plans";
import { PLAN_LIMITS } from "@/constants/platform";
import type {
  Business,
  BusinessCommercialState,
  Plan,
  PlanDefinition,
  PlanLimits,
  PlanSlug,
  PlatformSettings
} from "@/types";

export function getPlanSlugFromBusiness(business?: Pick<Business, "subscriptionPlanId">): PlanSlug {
  const value = business?.subscriptionPlanId ?? "plan-free";
  if (value.includes("premium")) return "premium";
  if (value.includes("standard")) return "standard";
  return "free";
}

export function getDefaultPlanDefinition(planSlug: PlanSlug) {
  return planDefinitions.find((plan) => plan.slug === planSlug) ?? planDefinitions[0];
}

export function getPlanDefinition(planSlug: PlanSlug, plans?: Plan[]): PlanDefinition {
  const fromCollection = plans?.find((plan) => plan.slug === planSlug);
  const fallback = getDefaultPlanDefinition(planSlug);

  return {
    ...fallback,
    ...fromCollection,
    slug: fallback.slug,
    limits: fromCollection?.config ?? fallback.limits
  };
}

export function getPlanLimits(plan: PlanSlug, plans?: Plan[]): PlanLimits {
  if (!plans?.length) {
    return PLAN_LIMITS[plan];
  }

  return getPlanDefinition(plan, plans).limits;
}

export function canAccessAdvancedAnalytics(plan: PlanSlug, plans?: Plan[]) {
  return getPlanLimits(plan, plans).advancedAnalytics;
}

export function canBeFeatured(plan: PlanSlug, plans?: Plan[]) {
  return getPlanLimits(plan, plans).featuredEligible;
}

export function canBeSponsored(plan: PlanSlug, plans?: Plan[]) {
  return getPlanLimits(plan, plans).sponsoredEligible;
}

export function getCommercialStateForBusiness(
  business: Business | undefined,
  plans?: Plan[],
  settings?: PlatformSettings
): BusinessCommercialState {
  const planSlug = getPlanSlugFromBusiness(business);
  const definition = getPlanDefinition(planSlug, plans);
  const config = definition.limits;
  const requiresVerification = settings?.featuredEligibilityRequiresVerification ?? true;
  const isVerified = business?.verificationStatus === "verified";
  const canUseBookings = config.bookingsEnabledByDefault;
  const canBeFeaturedNow = config.featuredEligible && (!requiresVerification || isVerified);
  const canBeSponsoredNow = !!settings?.allowSponsoredListings && config.sponsoredEligible;

  return {
    planSlug,
    planName: definition.name,
    config,
    canUseBookings,
    canUseAdvancedAnalytics: config.advancedAnalytics,
    canBeFeatured: canBeFeaturedNow,
    canBeSponsored: canBeSponsoredNow,
    canUsePromotionalTools: config.promotionalTools,
    maxGalleryImages: config.galleryLimit,
    upgradePrompt:
      planSlug === "free"
        ? "Upgrade to Standard to unlock more inventory, bookings and sponsored discovery."
        : planSlug === "standard"
          ? "Upgrade to Premium for homepage visibility, banner credits and stronger priority placement."
          : "Premium is active. Work with admin to activate sponsored and homepage placements."
  };
}

export function sanitizeBusinessForPlan(
  business: Business,
  plans?: Plan[],
  settings?: PlatformSettings
): Business {
  const state = getCommercialStateForBusiness(business, plans, settings);

  return {
    ...business,
    galleryUrls: business.galleryUrls.slice(0, state.maxGalleryImages),
    bookingsEnabled: state.canUseBookings ? business.bookingsEnabled : false,
    paymentsEnabled: state.config.paymentGatewayReady ? business.paymentsEnabled : false,
    featured: state.canBeFeatured ? business.featured : false,
    sponsoredStatus: state.canBeSponsored ? business.sponsoredStatus ?? "eligible" : "none",
    sponsoredPlacement: state.canBeSponsored ? business.sponsoredPlacement : undefined,
    allowInstantWhatsAppLead:
      state.config.whatsappLeadCapture && business.allowInstantWhatsAppLead !== false,
    leadFlowType: business.leadFlowType ?? "whatsapp_first",
    paymentProviderPreference:
      business.paymentProviderPreference ??
      settings?.supportedPaymentProviders?.[0] ??
      "placeholder",
    bannerCreditsUsed: Math.max(0, business.bannerCreditsUsed ?? 0)
  };
}

export function getPlanLockReason(
  capability: "services" | "products" | "featured" | "sponsored" | "analytics",
  state: BusinessCommercialState
) {
  const reasons = {
    services: `Your ${state.planName} plan allows up to ${state.config.servicesLimit} services.`,
    products: `Your ${state.planName} plan allows up to ${state.config.productsLimit} products.`,
    featured: "Featured placement is controlled by plan eligibility and admin approval.",
    sponsored: "Sponsored discovery requires an eligible plan and admin-managed activation.",
    analytics: "Advanced analytics are available on paid plans."
  };

  return reasons[capability];
}
