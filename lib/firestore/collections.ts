export const COLLECTIONS = {
  users: "users",
  businesses: "businesses",
  towns: "towns",
  categories: "categories",
  services: "services",
  products: "products",
  bookings: "bookings",
  enquiries: "enquiries",
  subscriptions: "subscriptions",
  plans: "plans",
  reviews: "reviews",
  banners: "banners",
  platform_settings: "platform_settings",
  activity_logs: "activity_logs"
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;

export function getCollectionName(key: CollectionKey) {
  return COLLECTIONS[key];
}
