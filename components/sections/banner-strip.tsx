import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { Banner } from "@/types";

export function BannerStrip({ items }: { items: Banner[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid gap-4">
      {items.map((banner) => (
        <Link href={banner.linkUrl} key={banner.id}>
          <Card className="overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
              <div
                className="min-h-44 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(15,31,28,0.08), rgba(15,31,28,0.45)), url(${banner.imageUrl})`
                }}
              />
              <div className="space-y-4 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-emerald">
                  {banner.campaignType === "sponsored_business" ? "Sponsored" : "Promotion"}
                </p>
                <div>
                  <h3 className="font-heading text-2xl font-semibold text-brand-ink">{banner.title}</h3>
                  {banner.description ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600">{banner.description}</p>
                  ) : null}
                </div>
                <span className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white">
                  {banner.ctaLabel ?? "Learn more"}
                </span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
