"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import { getCommercialPlanCatalog } from "@/services/commercial-service";
import { getPaymentProvider } from "@/services/payment/registry";
import type { Business, Plan, PlatformSettings, Subscription } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { getCommercialStateForBusiness } from "@/utils/plan";

export default function OwnerSubscriptionPage() {
  const { user } = useAuth();
  const businesses = useManagedCollection<Business>("businesses");
  const subscriptions = useManagedCollection<Subscription>("subscriptions");
  const plans = useManagedCollection<Plan>("plans");
  const settings = useManagedCollection<PlatformSettings>("platform_settings");
  const [message, setMessage] = useState("");

  const currentBusiness = useMemo(
    () => businesses.items.find((business) => business.ownerId === user?.id),
    [businesses.items, user?.id]
  );
  const currentSubscription = useMemo(
    () => subscriptions.items.find((item) => item.businessId === currentBusiness?.id),
    [currentBusiness?.id, subscriptions.items]
  );

  const currentSettings = settings.items[0];
  const commercialState = getCommercialStateForBusiness(currentBusiness, plans.items, currentSettings);
  const planCatalog = getCommercialPlanCatalog(plans.items).sort(
    (left, right) => left.sortOrder - right.sortOrder
  );

  async function upgrade(planId: string, amount: number) {
    if (!currentBusiness) return;
    const provider = getPaymentProvider(
      currentBusiness.paymentProviderPreference ??
        currentSettings?.supportedPaymentProviders?.[0] ??
        "placeholder"
    );
    const intent = await provider.createUpgradeIntent({
      businessId: currentBusiness.id,
      planId,
      amount,
      currency: currentSubscription?.currency ?? currentSettings?.currency ?? "ZAR"
    });
    setMessage(`Upgrade flow prepared with ${intent.provider}. Reference: ${intent.reference}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription"
        description="Track your current plan, renewal timing, monetization limits and upgrade options."
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-2xl font-semibold text-brand-ink">
            {commercialState.planName}
          </h2>
          <Badge variant={currentSubscription?.status === "active" ? "success" : "warning"}>
            {currentSubscription?.status ?? currentBusiness?.subscriptionStatus ?? "none"}
          </Badge>
          <Badge>{commercialState.config.analyticsTier}</Badge>
        </div>
        <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
          <p>
            <span className="font-semibold text-brand-ink">Amount:</span>{" "}
            {formatCurrency(currentSubscription?.amount ?? 0)}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Billing:</span>{" "}
            {currentSubscription?.billingCycle ?? "monthly"}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Ends:</span>{" "}
            {currentSubscription?.endsAt ? formatDate(currentSubscription.endsAt) : "Not set"}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Provider:</span>{" "}
            {currentBusiness?.paymentProviderPreference ?? "placeholder"}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Sponsored:</span>{" "}
            {commercialState.canBeSponsored ? "eligible" : "locked"}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Banner credits:</span>{" "}
            {commercialState.config.bannerCredits}
          </p>
        </div>
        <p className="text-sm text-brand-ink">{commercialState.upgradePrompt}</p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {planCatalog.map((plan) => {
          const isCurrent = currentBusiness?.subscriptionPlanId === plan.id;
          return (
            <Card className="space-y-4" key={plan.id}>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-2xl font-semibold text-brand-ink">{plan.name}</h3>
                {plan.highlightLabel ? <Badge>{plan.highlightLabel}</Badge> : null}
              </div>
              <p className="text-sm text-slate-600">
                {plan.price === 0 ? "Free plan" : `${formatCurrency(plan.price)} per month`}
              </p>
              <p className="text-sm leading-6 text-slate-600">{plan.description}</p>
              <div className="grid gap-2 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <p key={feature}>{feature}</p>
                ))}
              </div>
              <div className="grid gap-2 rounded-3xl bg-brand-mist p-4 text-sm text-slate-600">
                <p>Gallery limit: {plan.limits.galleryLimit}</p>
                <p>Services: {plan.limits.servicesLimit}</p>
                <p>Products: {plan.limits.productsLimit}</p>
                <p>Banner credits: {plan.limits.bannerCredits}</p>
              </div>
              <Button
                disabled={isCurrent || (!currentSettings?.allowFreePlan && plan.slug === "free")}
                onClick={() => void upgrade(plan.id, plan.price)}
                variant={plan.slug === "premium" ? "secondary" : "outline"}
              >
                {isCurrent ? "Current plan" : plan.ctaLabel ?? `Upgrade to ${plan.name}`}
              </Button>
            </Card>
          );
        })}
      </div>

      {message ? <Card className="text-sm text-brand-ink">{message}</Card> : null}
    </div>
  );
}
