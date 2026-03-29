export async function getDirectoryBootstrap() {
  return {
    categories: [
      { id: "1", name: "Food", slug: "food" },
      { id: "2", name: "Services", slug: "services" }
    ],
    towns: [
      { id: "1", name: "Vryheid", slug: "vryheid" }
    ]
  };
}

export async function searchBusinesses() {
  return [
    {
      business: {
        id: "1",
        name: "Demo Business",
        slug: "demo-business",
        categoryId: "1",
        townId: "1",
        description: "Demo business",
        isFeatured: true
      }
    }
  ];
}

export async function getBusinessBySlug() {
  return {
    id: "1",
    name: "Demo Business",
    slug: "demo-business",
    categoryId: "1",
    townId: "1",
    description: "Demo business",
    isFeatured: true
  };
}

export async function getBusinessCategory() {
  return { id: "1", name: "Food", slug: "food" };
}

export async function getBusinessTown() {
  return { id: "1", name: "Vryheid", slug: "vryheid" };
}

export async function getBusinessServices() {
  return [];
}

export async function getBusinessProducts() {
  return [];
}

export async function getRelatedBusinesses() {
  return [];
}

export async function getTownBySlug() {
  return { id: "1", name: "Vryheid", slug: "vryheid" };
}

export async function getCategoryBySlug() {
  return { id: "1", name: "Food", slug: "food" };
}

export async function getFeaturedBusinesses() {
  return [];
}

export async function getSponsoredBusinesses() {
  return [];
}