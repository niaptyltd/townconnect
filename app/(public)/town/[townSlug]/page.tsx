import { BusinessGrid } from "@/components/business/business-grid";
import { ManagedBannerStrip } from "@/components/sections/managed-banner-strip";
import { Card } from "@/components/ui/card";
import { PageState } from "@/components/ui/page-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";
import {
  getDirectoryBootstrap,
  getTownBySlug,
  searchBusinesses
} from "@/services/directory-service";

type TownPageProps = {
  params: Promise<{
    townSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: TownPageProps) {
  const { townSlug } = await params;

  return buildMetadata(
    `Businesses in ${townSlug}`,
    `Browse businesses available in ${townSlug}.`,
    `/town/${townSlug}`
  );
}

export default async function TownPage({ params }: TownPageProps) {
  const { townSlug } = await params;

  let error = "";
  let categories = [] as Awaited<ReturnType<typeof getDirectoryBootstrap>>["categories"];
  let towns = [] as Awaited<ReturnType<typeof getDirectoryBootstrap>>["towns"];
  let results = [] as Awaited<ReturnType<typeof searchBusinesses>>;
  let townName = townSlug;

  try {
    const [bootstrap, town, directoryResults] = await Promise.all([
      getDirectoryBootstrap(),
      getTownBySlug(townSlug),
      searchBusinesses({
        townSlug
      })
    ]);

    categories = bootstrap.categories;
    towns = bootstrap.towns;
    results = directoryResults;
    townName = town?.name ?? townSlug;
  } catch (pageError) {
    error =
      pageError instanceof Error
        ? pageError.message
        : "This town page could not be loaded right now.";
  }

  const resultBusinesses = results.map((item) => item.business);

  if (error) {
    return (
      <PageState
        title="Town page unavailable"
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
          eyebrow="Town"
          title={`Businesses in ${townName}`}
          description={`Explore local businesses available in ${townName}.`}
        />

        <Card>
          <p className="text-sm text-slate-600">{results.length} results found.</p>
        </Card>

        <ManagedBannerStrip
          placement="town"
          townId={towns.find((item) => item.slug === townSlug)?.id}
        />

        <BusinessGrid categories={categories} items={resultBusinesses} towns={towns} />
      </div>
    </section>
  );
}