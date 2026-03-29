import type { DemoLogin, NavItem, PlanLimitMap, PlatformStats } from "@/types";

export const APP_NAME = "TownConnect";
export const APP_TAGLINE = "Discover local businesses. Book services. Shop local. Grow local.";
export const APP_DESCRIPTION =
  "TownConnect is a mobile-first local business directory, booking, and commerce platform built for South African towns and ready to scale across Africa.";
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const PILOT_TOWN = {
  name: "Vryheid",
  province: "KwaZulu-Natal",
  country: "South Africa",
  slug: "vryheid"
} as const;

export const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape"
] as const;

export const DEMO_LOGINS: DemoLogin[] = [
  {
    label: "Customer Demo",
    email: "customer@townconnect.co.za",
    password: "TownConnect123!",
    role: "customer"
  },
  {
    label: "Business Owner Demo",
    email: "owner@townconnect.co.za",
    password: "TownConnect123!",
    role: "business_owner"
  },
  {
    label: "Admin Demo",
    email: "admin@townconnect.co.za",
    password: "TownConnect123!",
    role: "admin"
  }
];

export const PLATFORM_STATS: PlatformStats = {
  businesses: "120+",
  categories: "14",
  enquiries: "1.9k+",
  towns: "Ready for multi-town rollout"
};

export const PLAN_LIMITS: PlanLimitMap = {
  free: {
    galleryLimit: 3,
    featuredEligible: false,
    advancedAnalytics: false,
    analyticsTier: "basic",
    servicesLimit: 3,
    productsLimit: 6,
    promotionalTools: false,
    homepagePlacement: false,
    categoryBoost: false,
    bookingsEnabledByDefault: false,
    sponsoredEligible: false,
    bannerCredits: 0,
    priorityRankBoost: 0,
    whatsappLeadCapture: true,
    referralTracking: true,
    agentOnboarding: true,
    paymentGatewayReady: false
  },
  standard: {
    galleryLimit: 8,
    featuredEligible: true,
    advancedAnalytics: true,
    analyticsTier: "growth",
    servicesLimit: 15,
    productsLimit: 25,
    promotionalTools: true,
    homepagePlacement: false,
    categoryBoost: true,
    bookingsEnabledByDefault: true,
    sponsoredEligible: true,
    bannerCredits: 1,
    priorityRankBoost: 15,
    whatsappLeadCapture: true,
    referralTracking: true,
    agentOnboarding: true,
    paymentGatewayReady: false
  },
  premium: {
    galleryLimit: 15,
    featuredEligible: true,
    advancedAnalytics: true,
    analyticsTier: "advanced",
    servicesLimit: 50,
    productsLimit: 100,
    promotionalTools: true,
    homepagePlacement: true,
    categoryBoost: true,
    bookingsEnabledByDefault: true,
    sponsoredEligible: true,
    bannerCredits: 3,
    priorityRankBoost: 35,
    whatsappLeadCapture: true,
    referralTracking: true,
    agentOnboarding: true,
    paymentGatewayReady: true
  }
};

export const SUPPORTED_PAYMENT_PROVIDERS = ["placeholder", "payfast", "yoco", "ozow"] as const;

export const SOCIAL_LINKS: NavItem[] = [
  { href: "https://wa.me/27831234567", label: "WhatsApp" },
  { href: "mailto:hello@townconnect.co.za", label: "Email" },
  { href: "tel:+27831234567", label: "Call" }
];
