import { Search, Store, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    title: "Discover local businesses",
    description: "Search by town, category or need and find verified listings with clear contact options.",
    icon: Search
  },
  {
    title: "Book, enquire or buy",
    description: "Use built-in enquiry and booking flows that work well on mobile and support WhatsApp-first behaviour.",
    icon: Store
  },
  {
    title: "Help businesses grow",
    description: "Owners manage listings, showcase services and upgrade to paid plans for stronger reach and better tools.",
    icon: TrendingUp
  }
];

export function HowItWorksSection() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-8">
        <SectionHeading
          eyebrow="How it works"
          title="Simple enough for first-time digital users, structured enough for scale"
          description="The MVP is intentionally practical: fewer clicks, stronger lead generation and clean admin control."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((step) => (
            <Card className="space-y-4" key={step.title}>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sand">
                <step.icon className="h-6 w-6 text-brand-forest" />
              </div>
              <h3 className="font-heading text-2xl font-semibold text-brand-ink">{step.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
