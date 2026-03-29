import Link from "next/link";

import { PricingCatalog } from "@/components/commercial/pricing-catalog";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("List Your Business");

const faqs = [
  {
    question: "Do I need a website to join?",
    answer: "No. TownConnect is designed for businesses that need an online presence without building a full website first."
  },
  {
    question: "Can customers message me on WhatsApp?",
    answer: "Yes. WhatsApp is built into the listing experience because it matches how many local businesses already operate."
  },
  {
    question: "Can I start free?",
    answer: "Yes. The free plan is included in the MVP and admins can control access to selected features."
  }
];

export default function ListYourBusinessPage() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-12">
        <SectionHeading
          eyebrow="List your business"
          title="Get discovered online and turn interest into leads"
          description="TownConnect gives small-town businesses a polished public profile, WhatsApp-first lead capture, booking tools and a path to paid growth features."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {[
            "Show up in local search results",
            "Capture enquiries and bookings",
            "Promote services and products",
            "Manage your business without technical skills",
            "Unlock featured placements, sponsored listings and banner advertising"
          ].map((item) => (
            <Card className="text-sm leading-6 text-slate-700" key={item}>
              {item}
            </Card>
          ))}
        </div>

        <PricingCatalog ctaHref="/register" mode="compact" />

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-4 bg-brand-forest text-white">
            <h3 className="font-heading text-3xl font-semibold">Start your listing in minutes</h3>
            <p className="text-sm leading-6 text-white/80">
              Register as a business owner now and decide whether to create your listing immediately or later from your dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-brand-forest transition hover:bg-brand-sand"
                href="/register"
              >
                Create account
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                href="/pricing"
              >
                Compare plans
              </Link>
            </div>
          </Card>

          <div className="grid gap-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <h4 className="font-heading text-xl font-semibold text-brand-ink">{faq.question}</h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
