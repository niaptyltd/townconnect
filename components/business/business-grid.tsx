import { EmptyState } from "@/components/ui/empty-state";
import type { Business, Category, Town } from "@/types";

import { BusinessCard } from "@/components/business/business-card";

export function BusinessGrid({
  items,
  categories,
  towns,
  emptyTitle = "No businesses found",
  emptyDescription = "Try a different filter or search term."
}: {
  items: Business[];
  categories: Category[];
  towns: Town[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((business) => (
        <BusinessCard
          business={business}
          category={categories.find((category) => category.id === business.categoryId)}
          key={business.id}
          town={towns.find((town) => town.id === business.townId)}
        />
      ))}
    </div>
  );
}
