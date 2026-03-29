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

type DemoBusiness = {
  id: string;
  businessName: string;
  name: string;
  slug: string;
  categoryId: string;
  townId: string;
  description: string;
  shortDescription: string;
  addressLine1: string;
  suburb: string;
  phone: string;
  email: string;
  featured: boolean;
  isFeatured: boolean;
  sponsoredStatus: string;
  verificationStatus: "verified" | "pending";
  coverImageUrl: string;
  galleryUrls: string[];
  operatingHours: Array<{
    day: string;
    opens: string;
    closes: string;
    closed?: boolean;
  }>;
  bookingsEnabled: boolean;
};

const demoCategories: DemoCategory[] = [
  { id: "1", name: "Food", slug: "food" },
  { id: "2", name: "Services", slug: "services" }
];

const demoTowns: DemoTown[] = [
  { id: "1", name: "Vryheid", slug: "vryheid" }
];

const demoBusiness: DemoBusiness = {
  id: "1",
  businessName: "Demo Business",
  name: "Demo Business",
  slug: "demo-business",
  categoryId: "1",
  townId: "1",
  description: "This is a demo business profile for TownConnect.",
  shortDescription: "Demo business in Vryheid.",
  addressLine1: "123 Demo Street",
  suburb: "CBD",
  phone: "+27 61 000 0000",
  email: "demo@townconnect.co.za",
  featured: true,
  isFeatured: true,
  sponsoredStatus: "active",
  verificationStatus: "verified",
  coverImageUrl: "https://placehold.co/1200x600",
  galleryUrls: [
    "https://placehold.co/600x400",
    "https://placehold.co/600x400"
  ],
  operatingHours: [
    { day: "Monday", opens: "08:00", closes: "17:00" },
    { day: "Tuesday", opens: "08:00", closes: "17:00" },
    { day: "Wednesday", opens: "08:00", closes: "17:00" },
    { day: "Thursday", opens: "08:00", closes: "17:00" },
    { day: "Friday", opens: "08:00", closes: "17:00" }
  ],
  bookingsEnabled: true
};

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

export async function getBusinessCategory(_business?: DemoBusiness) {
  return demoCategories[0];
}

export async function getBusinessTown(_business?: DemoBusiness) {
  return demoTowns[0];
}

export async function getBusinessServices(_businessId?: string) {
  return [];
}

export async function getBusinessProducts(_businessId?: string) {
  return [];
}

export async function getRelatedBusinesses(_business?: DemoBusiness) {
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