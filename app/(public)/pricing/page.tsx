import Link from "next/link";

import { PricingCatalog } from "@/components/commercial/pricing-catalog";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("Pricing");

export default function PricingPage() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          align="center"
          eyebrow="Pricing"
          title="Simple plans for local growth"
          description="Start with a free listing, then unlock better discovery, more content, sponsored visibility and stronger tools as your business grows."
        />

        <PricingCatalog ctaHref="/register" mode="full" />

        <Card className="space-y-4 bg-brand-forest text-white">
          <h2 className="font-heading text-3xl font-semibold">Need a custom rollout?</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/80">
            TownConnect is built for phased growth. We can tailor onboarding, banner inventory,
            agent-assisted rollouts and future payment activation town by town.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-brand-forest transition hover:bg-brand-sand"
              href="/contact"
            >
              Talk to sales
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              href="/list-your-business"
            >
              List your business
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
