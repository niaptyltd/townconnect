"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Business, Enquiry, Plan, PlatformSettings, Product, Service } from "@/types";
import { getCommercialStateForBusiness } from "@/utils/plan";

export default function OwnerAnalyticsPage() {
  const { user } = useAuth();
  const businesses = useManagedCollection<Business>("businesses");
  const services = useManagedCollection<Service>("services");
  const products = useManagedCollection<Product>("products");
  const enquiries = useManagedCollection<Enquiry>("enquiries");
  const plans = useManagedCollection<Plan>("plans");
  const settings = useManagedCollection<PlatformSettings>("platform_settings");

  const currentBusiness = useMemo(
    () => businesses.items.find((business) => business.ownerId === user?.id),
    [businesses.items, user?.id]
  );

  const commercialState = getCommercialStateForBusiness(currentBusiness, plans.items, settings.items[0]);
  const topServices = useMemo(
    () => services.items.filter((item) => item.businessId === currentBusiness?.id).slice(0, 3),
    [currentBusiness?.id, services.items]
  );
  const topProducts = useMemo(
    () => products.items.filter((item) => item.businessId === currentBusiness?.id).slice(0, 3),
    [currentBusiness?.id, products.items]
  );
  const businessEnquiries = enquiries.items.filter((item) => item.businessId === currentBusiness?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="A monetization-ready analytics surface with tiered access by subscription plan."
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Profile views" value={currentBusiness?.viewsCount ?? 0} />
        <StatCard label="Enquiries" value={businessEnquiries.length} />
        <StatCard label="Analytics tier" value={commercialState.config.analyticsTier} />
        <StatCard label="Lead flow" value={currentBusiness?.leadFlowType ?? "whatsapp_first"} />
      </div>

      <Card className="space-y-3">
        <h2 className="font-heading text-2xl font-semibold text-brand-ink">Commercial analytics access</h2>
        <p className="text-sm text-slate-600">{commercialState.upgradePrompt}</p>
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>Banner credits available: {commercialState.config.bannerCredits}</p>
          <p>Priority boost score: {commercialState.config.priorityRankBoost}</p>
          <p>Referral tracking: {commercialState.config.referralTracking ? "enabled" : "locked"}</p>
          <p>Agent onboarding: {commercialState.config.agentOnboarding ? "ready" : "locked"}</p>
        </div>
      </Card>

      {commercialState.config.analyticsTier === "basic" ? (
        <Card className="text-sm leading-6 text-slate-600">
          Basic analytics gives you top-line counts. Upgrade to Standard or Premium to unlock richer item-level reporting and stronger discovery insights.
        </Card>
      ) : (
        <Card className="space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-brand-ink">Top viewed items</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-500">Services</p>
              {topServices.map((item, index) => (
                <div key={item.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-brand-ink">{item.title}</span>
                    <span className="text-slate-500">{100 - index * 18}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-brand-sand">
                    <div className="h-3 rounded-full bg-brand-emerald" style={{ width: `${100 - index * 18}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-500">Products</p>
              {topProducts.map((item, index) => (
                <div key={item.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-brand-ink">{item.title}</span>
                    <span className="text-slate-500">{92 - index * 16}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-brand-sand">
                    <div className="h-3 rounded-full bg-brand-gold" style={{ width: `${92 - index * 16}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
