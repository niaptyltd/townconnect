import { cache } from "react";

import { getFirebaseAdminDb } from "@/firebase/admin";
import { isFirebaseAdminConfigured } from "@/firebase/config";
import type { Business, Category, Product, SearchFilters, SearchResult, Service, Town } from "@/types";
import { isBusinessOpenNow } from "@/utils/hours";
import { getPlanSlugFromBusiness } from "@/utils/plan";

export class DirectoryServiceError extends Error {}

function assertDirectoryBackendConfigured() {
  if (!isFirebaseAdminConfigured) {
    throw new DirectoryServiceError(
      "The public directory is unavailable until Firebase Admin credentials are configured."
    );
  }
}

function matchSearchText(target: string, keyword?: string) {
  if (!keyword) return true;
  return target.toLowerCase().includes(keyword.toLowerCase());
}

function sortCategories(items: Category[]) {
  return [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.name.localeCompare(right.name);
  });
}

function sortTowns(items: Town[]) {
  return [...items].sort((left, right) => left.name.localeCompare(right.name));
}

function sortBusinesses(items: Business[]) {
  return [...items].sort((left, right) => (right.priorityScore ?? 0) - (left.priorityScore ?? 0));
}

function filterPublicBusinesses(
  businesses: Business[],
  towns: Town[],
  categories: Category[]
) {
  const townIds = new Set(towns.map((town) => town.id));
  const categoryIds = new Set(categories.map((category) => category.id));

  return businesses.filter(
    (business) =>
      business.listingStatus === "active" &&
      townIds.has(business.townId) &&
      categoryIds.has(business.categoryId)
  );
}

async function listDocumentsByIds<T extends { id: string }>(
  collectionName: "services" | "products",
  fieldName: "businessId",
  values: string[]
) {
  assertDirectoryBackendConfigured();

  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  if (uniqueValues.length === 0) {
    return [] as T[];
  }

  const db = getFirebaseAdminDb();
  const chunks: string[][] = [];
  for (let index = 0; index < uniqueValues.length; index += 10) {
    chunks.push(uniqueValues.slice(index, index + 10));
  }

  const snapshots = await Promise.all(
    chunks.map((chunk) => db.collection(collectionName).where(fieldName, "in", chunk).get())
  );

  const items = snapshots.flatMap((snapshot) => snapshot.docs.map((item) => item.data() as T));
  const map = new Map<string, T>();
  items.forEach((item) => {
    map.set(item.id, item);
  });

  return Array.from(map.values());
}

const getDirectoryBase = cache(async () => {
  assertDirectoryBackendConfigured();

  const db = getFirebaseAdminDb();
  const [townSnapshot, categorySnapshot, businessSnapshot] = await Promise.all([
    db.collection("towns").where("isActive", "==", true).get(),
    db.collection("categories").where("isActive", "==", true).get(),
    db.collection("businesses").where("listingStatus", "==", "active").get()
  ]);

  const towns = sortTowns(townSnapshot.docs.map((item) => item.data() as Town));
  const categories = sortCategories(categorySnapshot.docs.map((item) => item.data() as Category));
  const businesses = sortBusinesses(
    filterPublicBusinesses(
      businessSnapshot.docs.map((item) => item.data() as Business),
      towns,
      categories
    )
  );

  return {
    towns,
    categories,
    businesses
  };
});

const getSearchDataset = cache(async () => {
  const base = await getDirectoryBase();
  const businessIds = base.businesses.map((business) => business.id);
  const [services, products] = await Promise.all([
    listDocumentsByIds<Service>("services", "businessId", businessIds),
    listDocumentsByIds<Product>("products", "businessId", businessIds)
  ]);

  return {
    ...base,
    services: services.filter((service) => service.isActive),
    products: products.filter((product) => product.isActive)
  };
});

export async function getDirectoryBootstrap() {
  return getDirectoryBase();
}

export async function getTownBySlug(townSlug: string) {
  const { towns } = await getDirectoryBase();
  return towns.find((town) => town.slug === townSlug) ?? null;
}

export async function getCategoryBySlug(categorySlug: string) {
  const { categories } = await getDirectoryBase();
  return categories.find((category) => category.slug === categorySlug) ?? null;
}

export async function getBusinessBySlug(businessSlug: string) {
  const { businesses } = await getDirectoryBase();
  return businesses.find((business) => business.slug === businessSlug) ?? null;
}

export async function getBusinessCategory(business: Business) {
  const { categories } = await getDirectoryBase();
  return categories.find((category) => category.id === business.categoryId) ?? null;
}

export async function getBusinessTown(business: Business) {
  const { towns } = await getDirectoryBase();
  return towns.find((town) => town.id === business.townId) ?? null;
}

export async function getBusinessServices(businessId: string) {
  return (await listDocumentsByIds<Service>("services", "businessId", [businessId])).filter(
    (service) => service.isActive
  );
}

export async function getBusinessProducts(businessId: string) {
  return (await listDocumentsByIds<Product>("products", "businessId", [businessId])).filter(
    (product) => product.isActive
  );
}

export async function getFeaturedBusinesses(limit = 6) {
  const { businesses } = await getDirectoryBase();
  return businesses.filter((business) => business.featured).slice(0, limit);
}

export function isSponsoredBusiness(business: Business) {
  if (business.sponsoredStatus !== "active") return false;
  if (!business.sponsoredUntil) return true;
  return new Date(business.sponsoredUntil).getTime() >= Date.now();
}

export async function getSponsoredBusinesses(limit = 4) {
  const { businesses } = await getDirectoryBase();
  return businesses.filter((business) => isSponsoredBusiness(business)).slice(0, limit);
}

export async function getBusinessesByTownAndCategory(townSlug: string, categorySlug?: string) {
  const { businesses } = await getDirectoryBase();
  const town = await getTownBySlug(townSlug);
  if (!town) return [];

  const category = categorySlug ? await getCategoryBySlug(categorySlug) : null;

  return businesses.filter((business) => {
    const townMatch = business.townId === town.id;
    const categoryMatch = category ? business.categoryId === category.id : true;
    return townMatch && categoryMatch;
  });
}

export async function searchBusinesses(filters: SearchFilters): Promise<SearchResult[]> {
  const { businesses, categories, products, services, towns } = await getSearchDataset();
  const town = filters.townSlug ? towns.find((item) => item.slug === filters.townSlug) : undefined;
  const category = filters.categorySlug
    ? categories.find((item) => item.slug === filters.categorySlug)
    : undefined;

  return businesses
    .filter((business) => {
      const matchedTown = town ? business.townId === town.id : true;
      const matchedCategory = category ? business.categoryId === category.id : true;
      const matchedFeatured = filters.featured ? business.featured : true;
      const matchedOpen = filters.openNow ? isBusinessOpenNow(business) : true;
      const matchedDelivery = filters.delivery ? business.deliveryEnabled : true;
      const matchedPickup = filters.pickup ? business.pickupEnabled : true;
      const matchedBookings = filters.bookingsEnabled ? business.bookingsEnabled : true;

      return (
        matchedTown &&
        matchedCategory &&
        matchedFeatured &&
        matchedOpen &&
        matchedDelivery &&
        matchedPickup &&
        matchedBookings
      );
    })
    .map((business) => {
      const matchedServices = services.filter(
        (service) =>
          service.businessId === business.id && matchSearchText(service.title, filters.keyword)
      );
      const matchedProducts = products.filter(
        (product) =>
          product.businessId === business.id && matchSearchText(product.title, filters.keyword)
      );
      const businessCategory = categories.find((item) => item.id === business.categoryId);
      const businessTown = towns.find((item) => item.id === business.townId);

      const searchableText = [
        business.businessName,
        business.shortDescription,
        business.description,
        business.subcategory,
        business.tags.join(" "),
        businessCategory?.name ?? "",
        businessTown?.name ?? ""
      ].join(" ");

      const keywordMatch =
        !filters.keyword ||
        matchSearchText(searchableText, filters.keyword) ||
        matchedServices.length > 0 ||
        matchedProducts.length > 0;

      return keywordMatch
        ? {
            business,
            category: businessCategory,
            town: businessTown,
            matchedServices,
            matchedProducts,
            score:
              (isSponsoredBusiness(business) ? 12 : 0) +
              (business.featured ? 3 : 0) +
              (getPlanSlugFromBusiness(business) === "premium" ? 2 : 0) +
              (business.priorityScore ?? 0) +
              matchedServices.length * 2 +
              matchedProducts.length * 2 +
              (matchSearchText(business.businessName, filters.keyword) ? 5 : 0)
          }
        : null;
    })
    .filter(Boolean)
    .sort((left, right) => (right?.score ?? 0) - (left?.score ?? 0)) as SearchResult[];
}

export async function getRelatedBusinesses(business: Business, limit = 3) {
  const { businesses } = await getDirectoryBase();
  return businesses
    .filter((item) => item.id !== business.id && item.categoryId === business.categoryId)
    .slice(0, limit);
}

export async function getDirectoryStats() {
  const { businesses, categories, towns } = await getDirectoryBase();
  const { products, services } = await getSearchDataset();

  return {
    towns: towns.length,
    categories: categories.length,
    businesses: businesses.length,
    services: services.length,
    products: products.length
  };
}

export async function getTowns(): Promise<Town[]> {
  const { towns } = await getDirectoryBase();
  return towns;
}

export async function getCategories(): Promise<Category[]> {
  const { categories } = await getDirectoryBase();
  return categories;
}

export async function getBusinesses(): Promise<Business[]> {
  const { businesses } = await getDirectoryBase();
  return businesses;
}

export async function getServices(): Promise<Service[]> {
  const { services } = await getSearchDataset();
  return services;
}

export async function getProducts(): Promise<Product[]> {
  const { products } = await getSearchDataset();
  return products;
}
