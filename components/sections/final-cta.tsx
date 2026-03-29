import Link from "next/link";

import { Card } from "@/components/ui/card";

export function FinalCtaSection() {
  return (
    <section className="section-space">
      <div className="container-shell">
        <Card className="overflow-hidden bg-brand-forest text-white">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Grow local</p>
              <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
                Put your business where your town is already looking.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                Join TownConnect to get discovered, capture leads, manage bookings and build trust with a clean local profile.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-brand-forest transition hover:bg-brand-sand"
                href="/list-your-business"
              >
                Start your listing
              </Link>
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                href="/pricing"
              >
                Compare plans
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
