import type { Business } from "@/types";

type DemoCategory = {
  id: string;
  name: string;
  slug: string;
};

type DemoTown = {
  id: string;
  name: string;
  slug: string;
};

const demoCategories: DemoCategory[] = [
  { id: "1", name: "Food", slug: "food" },
  { id: "2", name: "Services", slug: "services" }
];

const demoTowns: DemoTown[] = [
  { id: "1", name: "Vryheid", slug: "vryheid" }
];

const demoBusiness = {
  id: "1",
  ownerId: "owner-1",
  businessName: "Demo Business",
  slug: "demo-business",
  description: "This is a demo business profile for TownConnect.",
  shortDescription: "Demo business in Vryheid.",
  categoryId: "1",
  subcategory: "",
  tags: [],
  townId: "1",
  province: "KwaZulu-Natal",
  addressLine1: "123 Demo Street",
  addressLine2: "",
  suburb: "CBD",
  postalCode: "3100",
  phone: "+27 61 000 0000",
  whatsappNumber: "+27 61 000 0000",
  email: "demo@townconnect.co.za",
  websiteUrl: "",
  logoUrl: "https://placehold.co/200x200",
  coverImageUrl: "https://placehold.co/1200x600",
  galleryUrls: [
    "https://placehold.co/600x400",
    "https://placehold.co/600x400"
  ],
  listingStatus: "active",
  verificationStatus: "verified",
  featured: true,
  sponsoredStatus: "active",
  paymentProviderPreference: "placeholder",
  leadFlowType: "whatsapp_first",
  bookingsEnabled: true,
  deliveryAvailable: false,
  pickupAvailable: false,
  operatingHours: [
    { day: "Monday", opens: "08:00", closes: "17:00" },
    { day: "Tuesday", opens: "08:00", closes: "17:00" },
    { day: "Wednesday", opens: "08:00", closes: "17:00" },
    { day: "Thursday", opens: "08:00", closes: "17:00" },
    { day: "Friday", opens: "08:00", closes: "17:00" }
  ],
  socialLinks: [],
  averageRating: 4.5,
  reviewCount: 12,
  referralCode: "DEMO123",
  agentId: "",
  subscriptionPlanId: "plan-free",
  subscriptionStatus: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
} as unknown as Business;

export async function getDirectoryBootstrap() {
  return {
    categories: demoCategories,
    towns: demoTowns
  };
}

export async function searchBusinesses(_filters?: {
  keyword?: string;
  townSlug?: string;
  categorySlug?: string;
  featured?: boolean;
  openNow?: boolean;
  delivery?: boolean;
  pickup?: boolean;
  bookingsEnabled?: boolean;
}) {
  return [{ business: demoBusiness }];
}

export async function getBusinessBySlug(_businessSlug?: string) {
  return demoBusiness;
}

export async function getBusinessCategory(_business?: Business) {
  return demoCategories[0];
}

export async function getBusinessTown(_business?: Business) {
  return demoTowns[0];
}

export async function getBusinessServices(_businessId?: string) {
  return [];
}

export async function getBusinessProducts(_businessId?: string) {
  return [];
}

export async function getRelatedBusinesses(_business?: Business) {
  return [];
}

export async function getTownBySlug(_townSlug?: string) {
  return demoTowns[0];
}

export async function getCategoryBySlug(_categorySlug?: string) {
  return demoCategories[0];
}

export async function getFeaturedBusinesses() {
  return [{ business: demoBusiness }];
}

export async function getSponsoredBusinesses() {
  return [{ business: demoBusiness }];
}