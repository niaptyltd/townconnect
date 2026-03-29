import { PLAN_LIMITS } from "@/constants/platform";
import type { PlanDefinition } from "@/types";

export const planDefinitions: PlanDefinition[] = [
  {
    id: "plan-free",
    name: "Free",
    slug: "free",
    price: 0,
    billingCycle: "monthly",
    description: "Launch a WhatsApp-first listing and capture demand before upgrading.",
    ctaLabel: "Start free",
    features: [
      "One basic business listing",
      "Limited gallery",
      "WhatsApp and call CTAs",
      "Lead capture via enquiries",
      "Referral and agent attribution ready"
    ],
    isActive: true,
    sortOrder: 1,
    limits: PLAN_LIMITS.free
  },
  {
    id: "plan-standard",
    name: "Standard",
    slug: "standard",
    price: 299,
    billingCycle: "monthly",
    description: "A growth plan for active local businesses that want bookings, products and better reach.",
    highlightLabel: "Best for growing businesses",
    ctaLabel: "Upgrade to Standard",
    recommended: true,
    features: [
      "More gallery images",
      "Products and services",
      "Booking tools",
      "Category boost",
      "Improved analytics",
      "Sponsored listing eligibility"
    ],
    isActive: true,
    sortOrder: 2,
    limits: PLAN_LIMITS.standard
  },
  {
    id: "plan-premium",
    name: "Premium",
    slug: "premium",
    price: 699,
    billingCycle: "monthly",
    description: "Premium visibility for brands that want homepage exposure, stronger discovery and promotion tools.",
    highlightLabel: "Highest visibility",
    ctaLabel: "Go Premium",
    features: [
      "Homepage feature eligibility",
      "Priority discovery",
      "Expanded gallery",
      "Promotional tools",
      "Banner ad credits",
      "Payments-ready status"
    ],
    isActive: true,
    sortOrder: 3,
    limits: PLAN_LIMITS.premium
  }
];
