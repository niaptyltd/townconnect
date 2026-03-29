import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import { HoursCard } from "@/components/business/hours-card";
import { ProductList } from "@/components/business/product-list";
import { RelatedBusinesses } from "@/components/business/related-businesses";
import { ServiceList } from "@/components/business/service-list";
import { BookingForm } from "@/components/forms/booking-form";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { ManagedBannerStrip } from "@/components/sections/managed-banner-strip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageState } from "@/components/ui/page-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";
import { buildWhatsAppUrl } from "@/services/lead-service";
import {
  getBusinessBySlug,
  getBusinessCategory,
  getDirectoryBootstrap,
  getBusinessProducts,
  getBusinessServices,
  getBusinessTown,
  getRelatedBusinesses
} from "@/services/directory-service";

type BusinessPageProps = {
  params: {
    businessSlug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BusinessPageProps) {
  try {
    const business = await getBusinessBySlug(params.businessSlug);
    if (!business) {
      return buildMetadata("Business");
    }

    return buildMetadata(
      business.businessName,
      business.shortDescription,
      `/business/${business.slug}`
    );
  } catch {
    return buildMetadata("Business");
  }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  let business = null as Awaited<ReturnType<typeof getBusinessBySlug>>;

  try {
    business = await getBusinessBySlug(params.businessSlug);
  } catch {
    return (
      <PageState
        title="Business page unavailable"
        description="We could not load this business profile from Firestore right now."
        actionHref="/search"
        actionLabel="Browse businesses"
        tone="error"
      />
    );
  }

  if (!business) notFound();

  try {
    const [category, town, serviceItems, productItems, related, bootstrap] = await Promise.all([
      getBusinessCategory(business),
      getBusinessTown(business),
      getBusinessServices(business.id),
      getBusinessProducts(business.id),
      getRelatedBusinesses(business),
      getDirectoryBootstrap()
    ]);

    return (
      <>
        <section className="overflow-hidden border-b border-brand-line/60 bg-white">
          <div
            className="h-72 bg-cover bg-center sm:h-96"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(15,31,28,0.16), rgba(15,31,28,0.52)), url(${business.coverImageUrl})`
            }}
          />
          <div className="container-shell -mt-14 pb-10 sm:-mt-20">
            <Card className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {business.sponsoredStatus === "active" ? <Badge variant="warning">Sponsored</Badge> : null}
                    {business.featured ? <Badge variant="success">Featured</Badge> : null}
                    <Badge>{category?.name ?? "Business"}</Badge>
                    <Badge variant={business.verificationStatus === "verified" ? "success" : "warning"}>
                      {business.verificationStatus}
                    </Badge>
                  </div>
                  <div>
                    <h1 className="font-heading text-4xl font-semibold text-brand-ink">
                      {business.businessName}
                    </h1>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                      {business.description}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-emerald" />
                      {business.addressLine1}, {business.suburb}, {town?.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-brand-emerald" />
                      {business.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-brand-emerald" />
                      {business.email}
                    </p>
                  </div>
                </div>

                <div className="grid w-full gap-3 sm:max-w-sm">
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white"
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
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-line px-5 text-sm font-semibold text-brand-ink"
                    href={`tel:${business.phone}`}
                  >
                    Call
                  </Link>
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-line px-5 text-sm font-semibold text-brand-ink"
                    href={`mailto:${business.email}`}
                  >
                    Email
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="section-space">
          <div className="container-shell grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8">
              {serviceItems.length > 0 ? (
                <div className="space-y-5">
                  <SectionHeading title="Services" />
                  <ServiceList items={serviceItems} />
                </div>
              ) : null}

              {productItems.length > 0 ? (
                <div className="space-y-5">
                  <SectionHeading title="Products" />
                  <ProductList items={productItems} />
                </div>
              ) : null}

              {business.galleryUrls.length > 0 ? (
                <div className="space-y-5">
                  <SectionHeading title="Gallery" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {business.galleryUrls.map((image) => (
                      <div
                        className="glass-card h-48 bg-cover bg-center"
                        key={image}
                        style={{ backgroundImage: `url(${image})` }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-5">
                <SectionHeading title="Related businesses" />
                <RelatedBusinesses
                  categories={bootstrap.categories}
                  items={related}
                  towns={bootstrap.towns}
                />
              </div>
            </div>

            <div className="space-y-6">
              <HoursCard hours={business.operatingHours} />
              <ManagedBannerStrip
                categoryId={business.categoryId}
                placement="business_sidebar"
                townId={business.townId}
              />
              {business.bookingsEnabled && serviceItems[0] ? (
                <BookingForm business={business} service={serviceItems[0]} />
              ) : null}
              <EnquiryForm business={business} />
            </div>
          </div>
        </section>
      </>
    );
  } catch {
    return (
      <PageState
        title="Business page unavailable"
        description="We could not load this business profile from Firestore right now."
        actionHref="/search"
        actionLabel="Browse businesses"
        tone="error"
      />
    );
  }
}
