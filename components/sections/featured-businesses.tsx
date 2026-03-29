import { BusinessGrid } from "@/components/business/business-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDirectoryBootstrap, getFeaturedBusinesses } from "@/services/directory-service";

export async function FeaturedBusinessesSection() {
  try {
    const [bootstrap, featuredBusinesses] = await Promise.all([
      getDirectoryBootstrap(),
      getFeaturedBusinesses()
    ]);

    if (featuredBusinesses.length === 0) {
      return null;
    }

    return (
      <section className="section-space bg-white/60">
        <div className="container-shell space-y-8">
          <SectionHeading
            eyebrow="Featured businesses"
            title="High-quality local listings ready for calls, WhatsApp chats and bookings"
            description="Premium and featured listings give strong businesses more visibility while keeping discovery simple for customers."
          />
          <BusinessGrid
            categories={bootstrap.categories}
            items={featuredBusinesses}
            towns={bootstrap.towns}
          />
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
