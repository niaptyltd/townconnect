"use client";

import Link from "next/link";
import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Booking, Business, Enquiry, Plan, PlatformSettings, Product, Service } from "@/types";
import { getCommercialStateForBusiness } from "@/utils/plan";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const businesses = useManagedCollection<Business>("businesses");
  const services = useManagedCollection<Service>("services");
  const products = useManagedCollection<Product>("products");
  const bookings = useManagedCollection<Booking>("bookings");
  const enquiries = useManagedCollection<Enquiry>("enquiries");
  const plans = useManagedCollection<Plan>("plans");
  const settings = useManagedCollection<PlatformSettings>("platform_settings");

  const currentBusiness = useMemo(
    () => businesses.items.find((business) => business.ownerId === user?.id),
    [businesses.items, user?.id]
  );

  const businessId = currentBusiness?.id;
  const commercialState = getCommercialStateForBusiness(currentBusiness, plans.items, settings.items[0]);

  const stats = useMemo(
    () => ({
      services: services.items.filter((item) => item.businessId === businessId).length,
      products: products.items.filter((item) => item.businessId === businessId).length,
      bookings: bookings.items.filter((item) => item.businessId === businessId).length,
      enquiries: enquiries.items.filter((item) => item.businessId === businessId).length
    }),
    [bookings.items, businessId, enquiries.items, products.items, services.items]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business overview"
        description="See your listing health, plan restrictions, WhatsApp-first lead setup and next upgrade opportunities."
      />

      {currentBusiness ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Profile views" value={currentBusiness.viewsCount} />
            <StatCard label="Enquiries" value={stats.enquiries} />
            <StatCard label="Bookings" value={stats.bookings} />
            <StatCard label="Services" value={stats.services} />
            <StatCard label="Products" value={stats.products} />
          </div>

          <Card className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div>
              <p className="text-sm text-slate-500">Listing status</p>
              <div className="mt-2">
                <Badge variant={currentBusiness.listingStatus === "active" ? "success" : "warning"}>
                  {currentBusiness.listingStatus}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Verification status</p>
              <div className="mt-2">
                <Badge variant={currentBusiness.verificationStatus === "verified" ? "success" : "warning"}>
                  {currentBusiness.verificationStatus}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Plan</p>
              <div className="mt-2">
                <Badge>{commercialState.planName}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Lead flow</p>
              <div className="mt-2">
                <Badge>{currentBusiness.leadFlowType ?? "whatsapp_first"}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Analytics tier</p>
              <div className="mt-2">
                <Badge>{commercialState.config.analyticsTier}</Badge>
              </div>
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={commercialState.canBeFeatured ? "success" : "warning"}>
                  {commercialState.canBeFeatured ? "Featured eligible" : "Featured locked"}
                </Badge>
                <Badge variant={commercialState.canBeSponsored ? "success" : "warning"}>
                  {commercialState.canBeSponsored ? "Sponsored eligible" : "Sponsored locked"}
                </Badge>
                <Badge variant={commercialState.canUseBookings ? "success" : "warning"}>
                  {commercialState.canUseBookings ? "Bookings available" : "Bookings locked"}
                </Badge>
              </div>
              <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <p>Gallery limit: {commercialState.maxGalleryImages} images</p>
                <p>Banner credits: {commercialState.config.bannerCredits}</p>
                <p>Priority boost: {commercialState.config.priorityRankBoost}</p>
                <p>
                  Payment gateway:{" "}
                  {commercialState.config.paymentGatewayReady ? "plan ready" : "upgrade required"}
                </p>
              </div>
              <p className="text-sm leading-6 text-brand-ink">{commercialState.upgradePrompt}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white"
                  href="/dashboard/subscription"
                >
                  View upgrade options
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-line px-5 text-sm font-semibold text-brand-ink"
                  href="/dashboard/business/edit"
                >
                  Update listing
                </Link>
              </div>
            </Card>

            <Card className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-brand-ink">Commercial readiness</h2>
              <div className="grid gap-3 text-sm text-slate-600">
                <p>Sponsored status: {currentBusiness.sponsoredStatus ?? "none"}</p>
                <p>Referral code: {currentBusiness.referralCode || "Not assigned yet"}</p>
                <p>Assigned agent: {currentBusiness.agentId || "Self-serve onboarding"}</p>
                <p>
                  Payment provider: {currentBusiness.paymentProviderPreference ?? "placeholder"}
                </p>
                <p>
                  WhatsApp-first: {currentBusiness.allowInstantWhatsAppLead === false ? "off" : "on"}
                </p>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <h2 className="font-heading text-2xl font-semibold text-brand-ink">No business profile yet</h2>
          <p className="mt-3 text-sm text-slate-600">
            Register a business from the edit page to unlock your listing tools and plan controls.
          </p>
        </Card>
      )}
    </div>
  );
}
