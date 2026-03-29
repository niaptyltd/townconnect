import { BusinessGrid } from "@/components/business/business-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDirectoryBootstrap, getSponsoredBusinesses } from "@/services/directory-service";

export async function SponsoredBusinessesSection() {
  try {
    const [bootstrap, sponsored] = await Promise.all([
      getDirectoryBootstrap(),
      getSponsoredBusinesses()
    ]);

    if (sponsored.length === 0) return null;

    return (
      <section className="section-space">
        <div className="container-shell space-y-8">
          <SectionHeading
            eyebrow="Sponsored discovery"
            title="Priority placements for businesses investing in visibility"
            description="Sponsored listings are managed through eligible plans and admin approval, so promotion stays structured instead of feeling spammy."
          />
          <BusinessGrid
            categories={bootstrap.categories}
            items={sponsored}
            towns={bootstrap.towns}
          />
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
