import Link from "next/link";

import { CategoryGridSection } from "@/components/sections/category-grid";
import { FeaturedBusinessesSection } from "@/components/sections/featured-businesses";
import { FinalCtaSection } from "@/components/sections/final-cta";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { ManagedBannerStrip } from "@/components/sections/managed-banner-strip";
import { SponsoredBusinessesSection } from "@/components/sections/sponsored-businesses";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";
import { getDirectoryBootstrap } from "@/services/directory-service";

export const metadata = buildMetadata("Home");
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories = [] as Awaited<ReturnType<typeof getDirectoryBootstrap>>["categories"];
  let towns = [] as Awaited<ReturnType<typeof getDirectoryBootstrap>>["towns"];

  try {
    const bootstrap = await getDirectoryBootstrap();
    categories = bootstrap.categories;
    towns = bootstrap.towns;
  } catch {
    categories = [];
    towns = [];
  }

  return (
    <>
      <HeroSection />
      <section className="container-shell pt-6">
        <ManagedBannerStrip placement="home_top" />
      </section>
      <CategoryGridSection categories={categories} townSlug={towns[0]?.slug} />
      <FeaturedBusinessesSection />
      <SponsoredBusinessesSection />
      <section className="container-shell">
        <ManagedBannerStrip placement="home_mid" />
      </section>

      <section className="section-space">
        <div className="container-shell space-y-8">
          <SectionHeading
            eyebrow="Explore towns"
            title="Launch in one town, scale cleanly to the next"
            description="TownConnect is built as a multi-town platform from day one, even while the pilot starts in Vryheid."
          />

          {towns.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-600">
                Towns will appear here once the live directory has active town records in Firestore.
              </p>
            </Card>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {towns.map((town) => (
                <Link href={`/town/${town.slug}`} key={town.id}>
                  <Card className="overflow-hidden p-0 transition hover:-translate-y-1">
                    <div
                      className="h-56 bg-cover bg-center"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(15,31,28,0.12), rgba(15,31,28,0.55)), url(${town.heroImageUrl})`
                      }}
                    />
                    <div className="space-y-3 p-6">
                      <h3 className="font-heading text-2xl font-semibold text-brand-ink">{town.name}</h3>
                      <p className="text-sm text-slate-600">
                        Pilot town for launch. Browse verified businesses, category directories and local commerce opportunities.
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <HowItWorksSection />
      <TestimonialsSection />
      <FinalCtaSection />
    </>
  );
}
