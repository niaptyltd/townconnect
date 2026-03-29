import Link from "next/link";
import { MapPin, Phone, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buildWhatsAppUrl } from "@/services/lead-service";
import type { Business, Category, Town } from "@/types";
import { getTodayOperatingLabel } from "@/utils/hours";

export function BusinessCard({
  business,
  category,
  town
}: {
  business: Business;
  category?: Category;
  town?: Town;
}) {
  return (
    <Card className="flex h-full flex-col gap-4 overflow-hidden p-0">
      <div
        className="h-44 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,31,28,0.06), rgba(15,31,28,0.45)), url(${business.coverImageUrl})`
        }}
      />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {business.sponsoredStatus === "active" ? <Badge variant="warning">Sponsored</Badge> : null}
              {business.featured ? <Badge variant="success">Featured</Badge> : null}
              <Badge>{category?.name ?? "Business"}</Badge>
            </div>
            <h3 className="font-heading text-2xl font-semibold text-brand-ink">{business.businessName}</h3>
            <p className="mt-2 text-sm text-slate-600">{business.shortDescription}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-brand-sand px-3 py-1 text-sm font-semibold text-brand-ink">
            <Star className="h-4 w-4 fill-brand-gold text-brand-gold" />
            {business.averageRating.toFixed(1)}
          </div>
        </div>

        <div className="grid gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-emerald" />
            <span>
              {business.suburb}, {town?.name ?? "Town"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-emerald" />
            <span>{business.phone}</span>
          </div>
          <p>{getTodayOperatingLabel(business)}</p>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <Link
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white"
            href={`/business/${business.slug}`}
          >
            View profile
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-line px-5 text-sm font-semibold text-brand-ink"
            href={buildWhatsAppUrl({
              business,
              intent: "enquiry",
              subject: business.businessName
            })}
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp
          </Link>
        </div>
      </div>
    </Card>
  );
}
