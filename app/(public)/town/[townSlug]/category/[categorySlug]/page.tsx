import { BusinessGrid } from "@/components/business/business-grid";
import { ManagedBannerStrip } from "@/components/sections/managed-banner-strip";
import { Card } from "@/components/ui/card";
import { PageState } from "@/components/ui/page-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";
import {
  getCategoryBySlug,
  getDirectoryBootstrap,
  getTownBySlug,
  searchBusinesses
} from "@/services/directory-service";

type CategoryPageProps = {
  params: Promise<{
    townSlug: string;
    categorySlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryPageProps) {
  const { townSlug, categorySlug } = await params;

  return buildMetadata(
    `${categorySlug} in ${townSlug}`,
    `Browse ${categorySlug} businesses in ${townSlug}.`,
    `/town/${townSlug}/category/${categorySlug}`
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { townSlug, categorySlug } = await params;

  let error = "";
  let categories = [] as Awaited<ReturnType<typeof getDirectoryBootstrap>>["categories"];
  let towns = [] as Awaited<ReturnType<typeof getDirectoryBootstrap>>["towns"];
  let results = [] as Awaited<ReturnType<typeof searchBusinesses>>;
  let townName = townSlug;
  let categoryName = categorySlug;

  try {
    const [bootstrap, town, category, directoryResults] = await Promise.all([
      getDirectoryBootstrap(),
      getTownBySlug(townSlug),
      getCategoryBySlug(categorySlug),
      searchBusinesses({
        townSlug,
        categorySlug
      })
    ]);

    categories = bootstrap.categories;
    towns = bootstrap.towns;
    results = directoryResults;
    townName = town?.name ?? townSlug;
    categoryName = category?.name ?? categorySlug;
  } catch (pageError) {
    error =
      pageError instanceof Error
        ? pageError.message
        : "This category page could not be loaded right now.";
  }

  const resultBusinesses = results.map((item) => item.business);

  if (error) {
    return (
      <PageState
        title="Category page unavailable"
        description={error}
        actionHref="/search"
        actionLabel="Browse businesses"
        tone="error"
      />
    );
  }

  return (
    <section className="section-space">
      <div className="container-shell space-y-8">
        <SectionHeading
          eyebrow="Category"
          title={`${categoryName} in ${townName}`}
          description={`Explore ${categoryName} businesses available in ${townName}.`}
        />

        <Card>
          <p className="text-sm text-slate-600">{results.length} results found.</p>
        </Card>

        <ManagedBannerStrip
          placement="category"
          townId={towns.find((item) => item.slug === townSlug)?.id}
          categoryId={categories.find((item) => item.slug === categorySlug)?.id}
        />

        <BusinessGrid categories={categories} items={resultBusinesses} towns={towns} />
      </div>
    </section>
  );
}