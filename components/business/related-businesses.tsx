import type { Business, Category, Town } from "@/types";

import { BusinessGrid } from "@/components/business/business-grid";

export function RelatedBusinesses({
  items,
  categories,
  towns
}: {
  items: Business[];
  categories: Category[];
  towns: Town[];
}) {
  return <BusinessGrid categories={categories} items={items} towns={towns} />;
}
