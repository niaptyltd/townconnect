import Link from "next/link";

import { SearchForm } from "@/components/forms/search-form";
import { PLATFORM_STATS } from "@/constants/platform";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-brand-line/60 bg-hero-radial">
      <div className="container-shell grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-emerald">
            Built for South African towns
          </p>
          <div className="space-y-5">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
              Discover local businesses, book services and shop local with confidence.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              TownConnect helps people in towns like Vryheid find trusted businesses fast, while giving local owners a clean digital storefront without needing a website.
            </p>
          </div>

          <SearchForm />

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-ink"
              href="/search"
            >
              Explore businesses
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-line px-5 text-sm font-semibold text-brand-ink transition hover:border-brand-emerald"
              href="/list-your-business"
            >
              List your business
            </Link>
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(PLATFORM_STATS).map(([label, value]) => (
              <div className="rounded-[1.5rem] border border-white/60 bg-white/85 p-4 shadow-soft" key={label}>
                <p className="font-heading text-2xl font-semibold text-brand-ink">{value}</p>
                <p className="mt-1 text-sm capitalize text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div
            className="min-h-[420px] rounded-[1.5rem] bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(15,31,28,0.18), rgba(15,31,28,0.52)), url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80)"
            }}
          >
            <div className="flex min-h-[420px] flex-col justify-end gap-5 p-6 text-white sm:p-8">
              <p className="max-w-sm text-sm uppercase tracking-[0.24em] text-white/80">Pilot town</p>
              <div>
                <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Vryheid, KwaZulu-Natal</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/85">
                  Launch with one town, scale with the same architecture to more towns, provinces and new markets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
