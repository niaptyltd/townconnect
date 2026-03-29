import { SUPPORTED_PAYMENT_PROVIDERS } from "@/constants/platform";
import { z } from "zod";

const trimmedString = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

const optionalTrimmedString = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .optional()
    .transform((value) => (value ? value : undefined));

const identifierSchema = trimmedString(1, 120);
const timestampSchema = z.string().datetime({ offset: true });
const currencySchema = trimmedString(3, 10).transform((value) => value.toUpperCase());

const urlOrPathSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
    "Enter a valid URL or internal path."
  );

const imageUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid image URL.")
  .refine((value) => /^https?:\/\//i.test(value), "Image URLs must use HTTP or HTTPS.");

const paymentProviderSchema = z.enum(SUPPORTED_PAYMENT_PROVIDERS);

export const adminPlanLimitsSchema = z
  .object({
    galleryLimit: z.coerce.number().int().min(0).max(50),
    featuredEligible: z.boolean(),
    advancedAnalytics: z.boolean(),
    analyticsTier: z.enum(["basic", "growth", "advanced"]),
    servicesLimit: z.coerce.number().int().min(0).max(100),
    productsLimit: z.coerce.number().int().min(0).max(200),
    promotionalTools: z.boolean(),
    homepagePlacement: z.boolean(),
    categoryBoost: z.boolean(),
    bookingsEnabledByDefault: z.boolean(),
    sponsoredEligible: z.boolean(),
    bannerCredits: z.coerce.number().int().min(0).max(20),
    priorityRankBoost: z.coerce.number().int().min(0).max(100),
    whatsappLeadCapture: z.boolean(),
    referralTracking: z.boolean(),
    agentOnboarding: z.boolean(),
    paymentGatewayReady: z.boolean()
  })
  .strict();

export const adminPlanUpdateSchema = z
  .object({
    id: identifierSchema,
    name: trimmedString(2, 60),
    slug: z.enum(["free", "standard", "premium"]),
    price: z.coerce.number().min(0).max(50000),
    billingCycle: z.enum(["monthly", "annual"]),
    features: z.array(trimmedString(1, 120)).min(1).max(20),
    description: optionalTrimmedString(220),
    highlightLabel: optionalTrimmedString(80),
    ctaLabel: optionalTrimmedString(80),
    recommended: z.boolean(),
    isActive: z.boolean(),
    sortOrder: z.coerce.number().int().min(0).max(20),
    config: adminPlanLimitsSchema
  })
  .strict();

const adminBannerBaseSchema = z
  .object({
    title: trimmedString(3, 120),
    description: optionalTrimmedString(240),
    placement: z.enum([
      "home_top",
      "home_mid",
      "category",
      "town",
      "search_top",
      "business_sidebar"
    ]),
    campaignType: z.enum(["promotion", "subscription", "partner", "sponsored_business"]),
    linkUrl: urlOrPathSchema,
    ctaLabel: optionalTrimmedString(60),
    imageUrl: imageUrlSchema,
    sponsorBusinessId: identifierSchema.optional().transform((value) => value ?? undefined),
    townId: identifierSchema.optional().transform((value) => value ?? undefined),
    categoryId: identifierSchema.optional().transform((value) => value ?? undefined),
    priority: z.coerce.number().int().min(0).max(50),
    startDate: timestampSchema,
    endDate: timestampSchema,
    isActive: z.boolean()
  })
  .strict()
  .superRefine((value, context) => {
    if (value.endDate <= value.startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Banner end date must be after the start date.",
        path: ["endDate"]
      });
    }

    if (value.placement === "town" && !value.townId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Town banners must be linked to a town.",
        path: ["townId"]
      });
    }

    if (value.placement === "category" && !value.categoryId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Category banners must be linked to a category.",
        path: ["categoryId"]
      });
    }

    if (value.campaignType === "sponsored_business" && !value.sponsorBusinessId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sponsored business banners must be linked to a business.",
        path: ["sponsorBusinessId"]
      });
    }

    if (value.campaignType !== "sponsored_business" && value.sponsorBusinessId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only sponsored business campaigns can target a sponsor business.",
        path: ["sponsorBusinessId"]
      });
    }
  });

export const adminBannerCreateSchema = adminBannerBaseSchema;

export const adminBannerUpdateSchema = adminBannerBaseSchema
  .extend({
    id: identifierSchema
  })
  .strict();

export const adminBannerStatusSchema = z
  .object({
    id: identifierSchema,
    isActive: z.boolean()
  })
  .strict();

export const adminBusinessActionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("verify"),
      businessId: identifierSchema
    })
    .strict(),
  z
    .object({
      action: z.literal("reject"),
      businessId: identifierSchema
    })
    .strict(),
  z
    .object({
      action: z.literal("set_listing_status"),
      businessId: identifierSchema,
      listingStatus: z.enum(["draft", "active", "suspended"])
    })
    .strict(),
  z
    .object({
      action: z.literal("set_featured"),
      businessId: identifierSchema,
      featured: z.boolean(),
      featuredUntil: timestampSchema.optional()
    })
    .strict(),
  z
    .object({
      action: z.literal("set_sponsored"),
      businessId: identifierSchema,
      sponsoredStatus: z.enum(["none", "eligible", "paused", "active"]),
      sponsoredPlacement: z
        .enum(["category_boost", "search_spotlight", "town_priority", "home_feature"])
        .optional(),
      sponsoredUntil: timestampSchema.optional()
    })
    .strict()
    .superRefine((value, context) => {
      if (value.sponsoredStatus === "active" && !value.sponsoredPlacement) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Active sponsored listings need a placement.",
          path: ["sponsoredPlacement"]
        });
      }
    })
]);

export const adminPlatformSettingsUpdateSchema = z
  .object({
    id: identifierSchema,
    currency: currencySchema,
    contactEmail: z.string().trim().email("Enter a valid contact email."),
    whatsappSupport: trimmedString(10, 30),
    featuredBusinessLimit: z.coerce.number().int().min(0).max(1000),
    sponsoredListingLimit: z.coerce.number().int().min(0).max(1000),
    allowSelfSignup: z.boolean(),
    allowFreePlan: z.boolean(),
    allowSponsoredListings: z.boolean(),
    leadFlowDefault: z.enum(["whatsapp_first", "hybrid", "form_first"]),
    supportedPaymentProviders: z
      .array(paymentProviderSchema)
      .min(1, "Select at least one payment provider.")
      .max(SUPPORTED_PAYMENT_PROVIDERS.length),
    featuredEligibilityRequiresVerification: z.boolean(),
    referralProgramEnabled: z.boolean(),
    agentCommissionEnabled: z.boolean()
  })
  .strict();

export const adminSubscriptionUpdateSchema = z
  .object({
    businessId: identifierSchema,
    subscriptionId: identifierSchema.optional(),
    planId: identifierSchema,
    status: z.enum(["active", "expired", "cancelled", "trial"]),
    billingCycle: z.enum(["monthly", "annual"]),
    startsAt: timestampSchema,
    endsAt: timestampSchema,
    providerSlug: paymentProviderSchema,
    paymentStatus: z.enum(["pending", "paid", "failed", "refunded", "mocked"])
  })
  .strict()
  .superRefine((value, context) => {
    if (value.endsAt <= value.startsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Subscription end date must be after the start date.",
        path: ["endsAt"]
      });
    }
  });

export const adminUserStatusSchema = z
  .object({
    id: identifierSchema,
    isActive: z.boolean()
  })
  .strict();

export const adminTownCreateSchema = z
  .object({
    name: trimmedString(2, 80),
    province: trimmedString(2, 80),
    country: trimmedString(2, 80),
    heroImageUrl: imageUrlSchema
  })
  .strict();

export const adminTownUpdateSchema = adminTownCreateSchema
  .extend({
    id: identifierSchema,
    isActive: z.boolean()
  })
  .strict();

export const adminTownStatusSchema = z
  .object({
    id: identifierSchema,
    isActive: z.boolean()
  })
  .strict();

export const adminCategoryCreateSchema = z
  .object({
    name: trimmedString(2, 80),
    icon: trimmedString(2, 60),
    description: trimmedString(4, 220),
    sortOrder: z.coerce.number().int().min(1).max(1000)
  })
  .strict();

export const adminCategoryUpdateSchema = adminCategoryCreateSchema
  .extend({
    id: identifierSchema,
    isActive: z.boolean()
  })
  .strict();

export const adminCategoryStatusSchema = z
  .object({
    id: identifierSchema,
    isActive: z.boolean()
  })
  .strict();

export type AdminPlanUpdateInput = z.infer<typeof adminPlanUpdateSchema>;
export type AdminBannerCreateInput = z.infer<typeof adminBannerCreateSchema>;
export type AdminBannerUpdateInput = z.infer<typeof adminBannerUpdateSchema>;
export type AdminBannerStatusInput = z.infer<typeof adminBannerStatusSchema>;
export type AdminBusinessActionInput = z.infer<typeof adminBusinessActionSchema>;
export type AdminPlatformSettingsUpdateInput = z.infer<typeof adminPlatformSettingsUpdateSchema>;
export type AdminSubscriptionUpdateInput = z.infer<typeof adminSubscriptionUpdateSchema>;
export type AdminUserStatusInput = z.infer<typeof adminUserStatusSchema>;
export type AdminTownCreateInput = z.infer<typeof adminTownCreateSchema>;
export type AdminTownUpdateInput = z.infer<typeof adminTownUpdateSchema>;
export type AdminTownStatusInput = z.infer<typeof adminTownStatusSchema>;
export type AdminCategoryCreateInput = z.infer<typeof adminCategoryCreateSchema>;
export type AdminCategoryUpdateInput = z.infer<typeof adminCategoryUpdateSchema>;
export type AdminCategoryStatusInput = z.infer<typeof adminCategoryStatusSchema>;
