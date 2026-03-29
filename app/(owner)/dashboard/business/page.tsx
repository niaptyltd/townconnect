"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Business, Plan, PlatformSettings } from "@/types";
import { getCommercialStateForBusiness } from "@/utils/plan";

export default function OwnerBusinessPage() {
  const { user } = useAuth();
  const businesses = useManagedCollection<Business>("businesses");
  const plans = useManagedCollection<Plan>("plans");
  const settings = useManagedCollection<PlatformSettings>("platform_settings");

  const currentBusiness = useMemo(
    () => businesses.items.find((business) => business.ownerId === user?.id),
    [businesses.items, user?.id]
  );

  if (!currentBusiness) {
    return (
      <Card>
        <h2 className="font-heading text-2xl font-semibold text-brand-ink">No business profile yet</h2>
        <p className="mt-3 text-sm text-slate-600">Use the edit page to create or complete your listing.</p>
      </Card>
    );
  }

  const commercialState = getCommercialStateForBusiness(currentBusiness, plans.items, settings.items[0]);

  return (
    <div className="space-y-6">
      <PageHeader title="Business profile" description="Your public listing details and commercial status at a glance." />

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={currentBusiness.listingStatus === "active" ? "success" : "warning"}>
            {currentBusiness.listingStatus}
          </Badge>
          <Badge variant={currentBusiness.verificationStatus === "verified" ? "success" : "warning"}>
            {currentBusiness.verificationStatus}
          </Badge>
          <Badge>{commercialState.planName}</Badge>
          <Badge variant={currentBusiness.sponsoredStatus === "active" ? "warning" : "neutral"}>
            {currentBusiness.sponsoredStatus ?? "none"}
          </Badge>
        </div>

        <div>
          <h2 className="font-heading text-3xl font-semibold text-brand-ink">{currentBusiness.businessName}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{currentBusiness.description}</p>
        </div>

        <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-semibold text-brand-ink">Phone:</span> {currentBusiness.phone}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Email:</span> {currentBusiness.email}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Town:</span> {currentBusiness.townId}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Address:</span> {currentBusiness.addressLine1}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Lead flow:</span> {currentBusiness.leadFlowType ?? "whatsapp_first"}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Payment provider:</span>{" "}
            {currentBusiness.paymentProviderPreference ?? "placeholder"}
          </p>
        </div>

        <p className="text-sm text-brand-ink">{commercialState.upgradePrompt}</p>
      </Card>
    </div>
  );
}
