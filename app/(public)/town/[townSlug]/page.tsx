import Link from "next/link";
import { notFound } from "next/navigation";

import { BusinessGrid } from "@/components/business/business-grid";
import { SearchForm } from "@/components/forms/search-form";
import { ManagedBannerStrip } from "@/components/sections/managed-banner-strip";
import { Card } from "@/components/ui/card";
import { PageState } from "@/components/ui/page-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";
import {
  getBusinessesByTownAndCategory,
  getDirectoryBootstrap,
  getTownBySlug
} from "@/services/directory-service";

type TownPageProps = {
  params: {
    townSlug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: TownPageProps) {
  try {
    const town = await getTownBySlug(params.townSlug);
    if (!town) {
      return buildMetadata("Town");
    }

    return buildMetadata(
      `${town.name} Businesses`,
      `Discover businesses in ${town.name}.`,
      `/town/${town.slug}`
    );
  } catch {
    return buildMetadata("Town");
  }
}

export default async function TownPage({ params }: TownPageProps) {
  let town = null as Awaited<ReturnType<typeof getTownBySlug>>;

  try {
    town = await getTownBySlug(params.townSlug);
  } catch {
    return (
      <PageState
        title="Town directory unavailable"
        description="We could not load this town directory from Firestore right now."
        actionHref="/search"
        actionLabel="Go to search"
        tone="error"
      />
    );
  }

  if (!town) notFound();

  try {
    const [bootstrap, townBusinesses] = await Promise.all([
      getDirectoryBootstrap(),
      getBusinessesByTownAndCategory(params.townSlug)
    ]);

    const featuredBusinesses = townBusinesses.filter((business) => business.featured);

    return (
      <>
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(15,31,28,0.25), rgba(15,31,28,0.7)), url(${town.heroImageUrl})`
            }}
          />
          <div className="container-shell relative space-y-6 py-20 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">Pilot town</p>
            <h1 className="font-heading text-4xl font-semibold sm:text-5xl">{town.name}</h1>
            <p className="max-w-2xl text-base leading-7 text-white/85">
              Browse businesses, compare categories and discover trusted local services in {town.name},{" "}
              {town.province}.
            </p>
            <SearchForm
              categoryOptions={bootstrap.categories}
              compact
              defaultValues={{ townSlug: town.slug }}
              townOptions={bootstrap.towns}
            />
          </div>
        </section>

        <section className="section-space">
          <div className="container-shell space-y-10">
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Categories"
                title={`Jump into ${town.name}'s business categories`}
                description="Browse category-first if you already know the kind of business you need."
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {bootstrap.categories.map((category) => (
                  <Link href={`/town/${town.slug}/category/${category.slug}`} key={category.id}>
                    <Card className="h-full transition hover:-translate-y-1 hover:border-brand-emerald">
                      <h3 className="font-heading text-xl font-semibold text-brand-ink">{category.name}</h3>
                      <p className="mt-3 text-sm text-slate-600">{category.description}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {featuredBusinesses.length > 0 ? (
              <div className="space-y-6">
                <SectionHeading
                  eyebrow="Featured"
                  title="Featured businesses in town"
                  description="Premium visibility for local businesses that want stronger discovery."
                />
                <BusinessGrid
                  categories={bootstrap.categories}
                  items={featuredBusinesses}
                  towns={bootstrap.towns}
                />
              </div>
            ) : null}

            <ManagedBannerStrip placement="town" townId={town.id} />

            <div className="space-y-6">
              <SectionHeading
                eyebrow="All listings"
                title={`All businesses in ${town.name}`}
                description="Every active listing available in this town directory."
              />
              <BusinessGrid
                categories={bootstrap.categories}
                items={townBusinesses}
                towns={bootstrap.towns}
              />
            </div>
          </div>
        </section>
      </>
    );
  } catch {
    return (
      <PageState
        title="Town directory unavailable"
        description="We could not load this town directory from Firestore right now."
        actionHref="/search"
        actionLabel="Go to search"
        tone="error"
      />
    );
  }
}
