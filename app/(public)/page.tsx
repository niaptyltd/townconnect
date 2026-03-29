import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("Home");
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <section className="section-space">
        <div className="container-shell space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              TownConnect
            </p>
            <h1 className="font-heading text-4xl font-semibold text-brand-ink sm:text-5xl">
              Grow local, town by town
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              TownConnect is a mobile-first local business directory, booking and commerce
              platform built for South African towns, starting with Vryheid.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white"
                href="/search"
              >
                Browse businesses
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-line px-5 text-sm font-semibold text-brand-ink"
                href="/list-your-business"
              >
                List your business
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-shell space-y-8">
          <SectionHeading
            eyebrow="Pilot town"
            title="Launching in Vryheid"
            description="This demo version is running with safe fallback content while the live data layer is being finalized."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <Link href="/town/vryheid">
              <Card className="space-y-3 p-6 transition hover:-translate-y-1">
                <h3 className="font-heading text-2xl font-semibold text-brand-ink">Vryheid</h3>
                <p className="text-sm text-slate-600">
                  Explore the pilot town and browse local business listings.
                </p>
              </Card>
            </Link>

            <Link href="/business/demo-business">
              <Card className="space-y-3 p-6 transition hover:-translate-y-1">
                <h3 className="font-heading text-2xl font-semibold text-brand-ink">
                  Demo Business
                </h3>
                <p className="text-sm text-slate-600">
                  Visit a sample business profile and test the customer-facing experience.
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-shell">
          <Card className="space-y-3 p-6">
            <h2 className="font-heading text-2xl font-semibold text-brand-ink">
              Demo mode is active
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              The platform is live, deployed, and currently using fallback demo content while
              Firebase-backed data is still being completed.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}