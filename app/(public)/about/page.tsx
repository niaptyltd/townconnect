import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("About");

export default function AboutPage() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="About TownConnect"
          title="A local commerce platform designed for real town economies"
          description="TownConnect was shaped around the reality that many small businesses need discovery, lead generation and trust tools before they need a full website."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="space-y-3">
            <h3 className="font-heading text-2xl font-semibold text-brand-ink">Why it exists</h3>
            <p className="text-sm leading-6 text-slate-600">
              Small-town businesses are often discoverable only through word-of-mouth or social posts. TownConnect gives them a structured, searchable digital presence.
            </p>
          </Card>
          <Card className="space-y-3">
            <h3 className="font-heading text-2xl font-semibold text-brand-ink">What it solves</h3>
            <p className="text-sm leading-6 text-slate-600">
              Customers can find the right business faster, owners can manage listings and leads, and admins can run a monetizable local commerce platform.
            </p>
          </Card>
          <Card className="space-y-3">
            <h3 className="font-heading text-2xl font-semibold text-brand-ink">Where it goes next</h3>
            <p className="text-sm leading-6 text-slate-600">
              The architecture is ready for multi-town expansion, province-level rollouts, paid plans, featured placements and future payment integrations.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
