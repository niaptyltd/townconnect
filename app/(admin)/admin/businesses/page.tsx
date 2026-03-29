"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminCollection } from "@/hooks/use-admin-collection";
import {
  listBusinesses,
  listPlans,
  listSettings,
  mutateBusiness
} from "@/services/admin-service";
import {
  canAdminFeatureBusiness,
  canAdminSponsorBusiness
} from "@/services/commercial-service";
import type { Business, Plan, PlatformSettings } from "@/types";
import { getCommercialStateForBusiness } from "@/utils/plan";

export default function AdminBusinessesPage() {
  const businesses = useAdminCollection<Business>(listBusinesses);
  const plans = useAdminCollection<Plan>(listPlans);
  const settings = useAdminCollection<PlatformSettings>(listSettings);
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const currentSettings = settings.items[0];
  const featuredCount = useMemo(
    () => businesses.items.filter((business) => business.featured).length,
    [businesses.items]
  );
  const sponsoredCount = useMemo(
    () => businesses.items.filter((business) => business.sponsoredStatus === "active").length,
    [businesses.items]
  );

  async function runAction(
    business: Business,
    actionKey: string,
    input:
      | { action: "verify"; businessId: string }
      | { action: "reject"; businessId: string }
      | { action: "set_listing_status"; businessId: string; listingStatus: Business["listingStatus"] }
      | { action: "set_featured"; businessId: string; featured: boolean; featuredUntil?: string }
      | {
          action: "set_sponsored";
          businessId: string;
          sponsoredStatus: "none" | "eligible" | "paused" | "active";
          sponsoredPlacement?: NonNullable<Business["sponsoredPlacement"]>;
          sponsoredUntil?: string;
        },
    successMessage: string
  ) {
    setPendingAction(actionKey);
    try {
      await mutateBusiness(input);
      await businesses.refresh();
      setMessage(successMessage);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update the business right now."
      );
    } finally {
      setPendingAction("");
    }
  }

  if (businesses.loading || plans.loading || settings.loading) {
    return <Card>Loading business moderation controls...</Card>;
  }

  if (businesses.error || plans.error || settings.error) {
    return (
      <Card className="text-sm text-rose-600">
        {businesses.error || plans.error || settings.error}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Businesses"
        description="Approve, verify, suspend, feature and sponsor business listings with plan-aware controls."
      />

      {message ? <Card className="text-sm text-brand-ink">{message}</Card> : null}

      <div className="grid gap-4">
        {businesses.items.map((business) => {
          const commercialState = getCommercialStateForBusiness(
            business,
            plans.items,
            currentSettings
          );
          const featureEligible = canAdminFeatureBusiness(
            business,
            plans.items,
            currentSettings
          );
          const sponsorEligible = canAdminSponsorBusiness(
            business,
            plans.items,
            currentSettings
          );

          return (
            <Card className="space-y-4" key={business.id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={business.verificationStatus === "verified" ? "success" : "warning"}>
                      {business.verificationStatus}
                    </Badge>
                    <Badge variant={business.listingStatus === "active" ? "success" : "danger"}>
                      {business.listingStatus}
                    </Badge>
                    <Badge>{commercialState.planName}</Badge>
                    {business.featured ? <Badge variant="success">featured</Badge> : null}
                    {business.sponsoredStatus === "active" ? (
                      <Badge variant="warning">sponsored</Badge>
                    ) : null}
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-semibold text-brand-ink">
                      <Link href={`/admin/businesses/${business.id}`}>{business.businessName}</Link>
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">{business.shortDescription}</p>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>Featured eligible: {featureEligible ? "yes" : "no"}</p>
                    <p>Sponsored eligible: {sponsorEligible ? "yes" : "no"}</p>
                    <p>Lead flow: {business.leadFlowType ?? "whatsapp_first"}</p>
                    <p>Referral: {business.referralCode || "not set"}</p>
                    <p>Featured slots used: {featuredCount}</p>
                    <p>Sponsored slots used: {sponsoredCount}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={pendingAction === `${business.id}:verify`}
                    onClick={() =>
                      void runAction(
                        business,
                        `${business.id}:verify`,
                        { action: "verify", businessId: business.id },
                        `${business.businessName} verified.`
                      )
                    }
                    variant="outline"
                  >
                    Verify
                  </Button>
                  <Button
                    disabled={pendingAction === `${business.id}:reject`}
                    onClick={() =>
                      void runAction(
                        business,
                        `${business.id}:reject`,
                        { action: "reject", businessId: business.id },
                        `${business.businessName} rejected and suspended.`
                      )
                    }
                    variant="outline"
                  >
                    Reject
                  </Button>
                  <Button
                    disabled={pendingAction === `${business.id}:status`}
                    onClick={() =>
                      void runAction(
                        business,
                        `${business.id}:status`,
                        {
                          action: "set_listing_status",
                          businessId: business.id,
                          listingStatus:
                            business.listingStatus === "suspended" ? "active" : "suspended"
                        },
                        business.listingStatus === "suspended"
                          ? `${business.businessName} reactivated.`
                          : `${business.businessName} suspended.`
                      )
                    }
                    variant="outline"
                  >
                    {business.listingStatus === "suspended" ? "Unsuspend" : "Suspend"}
                  </Button>
                  <Button
                    disabled={
                      pendingAction === `${business.id}:featured` ||
                      (!featureEligible && !business.featured)
                    }
                    onClick={() =>
                      void runAction(
                        business,
                        `${business.id}:featured`,
                        {
                          action: "set_featured",
                          businessId: business.id,
                          featured: !business.featured
                        },
                        business.featured
                          ? `${business.businessName} removed from featured placement.`
                          : `${business.businessName} featured successfully.`
                      )
                    }
                    variant="secondary"
                  >
                    {business.featured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button
                    disabled={
                      pendingAction === `${business.id}:sponsored` ||
                      (!sponsorEligible && business.sponsoredStatus !== "active")
                    }
                    onClick={() =>
                      void runAction(
                        business,
                        `${business.id}:sponsored`,
                        {
                          action: "set_sponsored",
                          businessId: business.id,
                          sponsoredStatus:
                            business.sponsoredStatus === "active" ? "eligible" : "active",
                          sponsoredPlacement:
                            business.sponsoredStatus === "active"
                              ? undefined
                              : business.sponsoredPlacement ?? "category_boost"
                        },
                        business.sponsoredStatus === "active"
                          ? `${business.businessName} removed from sponsored discovery.`
                          : `${business.businessName} sponsored successfully.`
                      )
                    }
                    variant="outline"
                  >
                    {business.sponsoredStatus === "active" ? "Unsponsor" : "Sponsor"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
