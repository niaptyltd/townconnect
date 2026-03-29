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
        description: "This is demo data",
        isFeatured: true
      }
    }
  ];
}