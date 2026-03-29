import { BusinessGrid } from "@/components/business/business-grid";
import { SearchForm } from "@/components/forms/search-form";
import { ManagedBannerStrip } from "@/components/sections/managed-banner-strip";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";
import { getDirectoryBootstrap, searchBusinesses } from "@/services/directory-service";

export const metadata = buildMetadata("Search");
export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams?: {
    keyword?: string;
    town?: string;
    category?: string;
    featured?: string;
    openNow?: string;
    delivery?: string;
    pickup?: string;
    bookings?: string;
  };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  let error = "";
  let categories = [] as Awaited<ReturnType<typeof getDirectoryBootstrap>>["categories"];
  let towns = [] as Awaited<ReturnType<typeof getDirectoryBootstrap>>["towns"];
  let results = [] as Awaited<ReturnType<typeof searchBusinesses>>;

  try {
    const [bootstrap, directoryResults] = await Promise.all([
      getDirectoryBootstrap(),
      searchBusinesses({
        keyword: searchParams?.keyword,
        townSlug: searchParams?.town,
        categorySlug: searchParams?.category,
        featured: searchParams?.featured === "true",
        openNow: searchParams?.openNow === "true",
        delivery: searchParams?.delivery === "true",
        pickup: searchParams?.pickup === "true",
        bookingsEnabled: searchParams?.bookings === "true"
      })
    ]);

    categories = bootstrap.categories;
    towns = bootstrap.towns;
    results = directoryResults;
  } catch (searchError) {
    error =
      searchError instanceof Error
        ? searchError.message
        : "The directory could not be loaded right now.";
  }

  const resultBusinesses = results.map((item) => item.business);

  return (
    <section className="section-space">
      <div className="container-shell space-y-8">
        <SectionHeading
          eyebrow="Search"
          title="Browse the local business directory"
          description="Search by keyword, town, category or use the quick filters to narrow down listings."
        />

        <Card className="space-y-4">
          <SearchForm
            categoryOptions={error ? undefined : categories}
            compact
            defaultValues={{
              keyword: searchParams?.keyword,
              townSlug: searchParams?.town,
              categorySlug: searchParams?.category
            }}
            townOptions={error ? undefined : towns}
          />
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              ["featured", "Featured"],
              ["openNow", "Open now"],
              ["delivery", "Delivery"],
              ["pickup", "Pickup"],
              ["bookings", "Bookings enabled"]
            ].map(([key, label]) => {
              const params = new URLSearchParams();
              if (searchParams?.keyword) params.set("keyword", searchParams.keyword);
              if (searchParams?.town) params.set("town", searchParams.town);
              if (searchParams?.category) params.set("category", searchParams.category);
              const active = searchParams?.[key as keyof SearchPageProps["searchParams"]] === "true";
              params.set(key, String(!active));
              return (
                <a
                  className={`rounded-full px-4 py-2 ${
                    active ? "bg-brand-forest text-white" : "bg-brand-sand text-brand-ink"
                  }`}
                  href={`/search?${params.toString()}`}
                  key={key}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </Card>

        {error ? (
          <Card>
            <p className="text-sm text-rose-700">{error}</p>
          </Card>
        ) : (
          <p className="text-sm text-slate-600">{results.length} results found.</p>
        )}

        <ManagedBannerStrip placement="search_top" />

        <BusinessGrid categories={categories} items={resultBusinesses} towns={towns} />
      </div>
    </section>
  );
}
