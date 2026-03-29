import type { MetadataRoute } from "next";

import { BASE_URL } from "@/constants/platform";
import { getDirectoryBootstrap } from "@/services/directory-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/about", "/contact", "/pricing", "/search", "/list-your-business", "/login", "/register"];

  const staticEntries = pages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date()
  }));

  try {
    const { businesses, categories, towns } = await getDirectoryBootstrap();

    const townEntries = towns.map((town) => ({
      url: `${BASE_URL}/town/${town.slug}`,
      lastModified: new Date(town.updatedAt)
    }));

    const categoryEntries = towns.flatMap((town) =>
      categories.map((category) => ({
        url: `${BASE_URL}/town/${town.slug}/category/${category.slug}`,
        lastModified: new Date(category.updatedAt)
      }))
    );

    const businessEntries = businesses.map((business) => ({
      url: `${BASE_URL}/business/${business.slug}`,
      lastModified: new Date(business.updatedAt)
    }));

    return [...staticEntries, ...townEntries, ...categoryEntries, ...businessEntries];
  } catch {
    return staticEntries;
  }
}
