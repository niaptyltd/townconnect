import { notFound } from "next/navigation";

import { BusinessGrid } from "@/components/business/business-grid";
import { SearchForm } from "@/components/forms/search-form";
import { ManagedBannerStrip } from "@/components/sections/managed-banner-strip";
import { PageState } from "@/components/ui/page-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";
import {
  getBusinessesByTownAndCategory,
  getDirectoryBootstrap,
  getCategoryBySlug,
  getTownBySlug
} from "@/services/directory-service";

type CategoryPageProps = {
  params: {
    townSlug: string;
    categorySlug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryPageProps) {
  try {
    const [town, category] = await Promise.all([
      getTownBySlug(params.townSlug),
      getCategoryBySlug(params.categorySlug)
    ]);

    if (!town || !category) {
      return buildMetadata("Category");
    }

    return buildMetadata(
      `${category.name} in ${town.name}`,
      `Find ${category.name.toLowerCase()} businesses in ${town.name}.`,
      `/town/${town.slug}/category/${category.slug}`
    );
  } catch {
    return buildMetadata("Category");
  }
}

export default async function CategoryTownPage({ params }: CategoryPageProps) {
  let town = null as Awaited<ReturnType<typeof getTownBySlug>>;
  let category = null as Awaited<ReturnType<typeof getCategoryBySlug>>;

  try {
    [town, category] = await Promise.all([
      getTownBySlug(params.townSlug),
      getCategoryBySlug(params.categorySlug)
    ]);
  } catch {
    return (
      <PageState
        title="Category directory unavailable"
        description="We could not load this category view from Firestore right now."
        actionHref="/search"
        actionLabel="Go to search"
        tone="error"
      />
    );
  }

  if (!town || !category) notFound();

  try {
    const [bootstrap, results] = await Promise.all([
      getDirectoryBootstrap(),
      getBusinessesByTownAndCategory(params.townSlug, params.categorySlug)
    ]);

    return (
      <section className="section-space">
        <div className="container-shell space-y-8">
          <SectionHeading
            eyebrow={town.name}
            title={`${category.name} businesses`}
            description={category.description}
          />

          <SearchForm
            categoryOptions={bootstrap.categories}
            compact
            defaultValues={{ townSlug: town.slug, categorySlug: category.slug }}
            townOptions={bootstrap.towns}
          />

          <ManagedBannerStrip
            categoryId={category.id}
            placement="category"
            townId={town.id}
          />

          <BusinessGrid
            categories={bootstrap.categories}
            emptyDescription={`No ${category.name.toLowerCase()} businesses found in ${town.name} yet.`}
            items={results}
            towns={bootstrap.towns}
          />
        </div>
      </section>
    );
  } catch {
    return (
      <PageState
        title="Category directory unavailable"
        description="We could not load this category view from Firestore right now."
        actionHref="/search"
        actionLabel="Go to search"
        tone="error"
      />
    );
  }
}
