"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import { getCommercialPlanCatalog } from "@/services/commercial-service";
import type { Plan } from "@/types";
import { formatCurrency } from "@/utils/format";

export function PricingCatalog({
  mode = "full",
  ctaHref = "/register"
}: {
  mode?: "full" | "compact";
  ctaHref?: string;
}) {
  const plans = useManagedCollection<Plan>("plans");
  const catalog = useMemo(
    () =>
      getCommercialPlanCatalog(plans.items.length ? plans.items : undefined).sort(
        (left, right) => left.sortOrder - right.sortOrder
      ),
    [plans.items]
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-3">
        {catalog.map((plan) => (
          <Card
            className={`space-y-6 ${
              plan.recommended ? "border-brand-emerald bg-white" : ""
            }`}
            key={plan.id}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-3xl font-semibold text-brand-ink">{plan.name}</h2>
                {plan.highlightLabel ? (
                  <span className="rounded-full bg-brand-sand px-3 py-1 text-xs font-semibold text-brand-forest">
                    {plan.highlightLabel}
                  </span>
                ) : null}
              </div>
              {plan.description ? (
                <p className="text-sm leading-6 text-slate-600">{plan.description}</p>
              ) : null}
            </div>

            <div>
              <p className="font-heading text-4xl font-semibold text-brand-forest">
                {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
              </p>
              <p className="text-sm text-slate-500">per {plan.billingCycle}</p>
            </div>

            <div className="grid gap-2 text-sm text-slate-700">
              {plan.features.map((feature) => (
                <p key={feature}>{feature}</p>
              ))}
            </div>

            <div className="grid gap-2 rounded-3xl bg-brand-mist p-4 text-sm text-slate-600">
              <p>Gallery: up to {plan.limits.galleryLimit} images</p>
              <p>
                Inventory: {plan.limits.servicesLimit} services / {plan.limits.productsLimit} products
              </p>
              <p>Analytics: {plan.limits.analyticsTier}</p>
              <p>
                Sponsored: {plan.limits.sponsoredEligible ? "eligible" : "not included"}
              </p>
            </div>

            <Link
              className={`inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                plan.recommended
                  ? "bg-brand-forest text-white hover:bg-brand-ink"
                  : "border border-brand-line bg-white text-brand-ink hover:border-brand-emerald hover:text-brand-forest"
              }`}
              href={ctaHref}
            >
              {plan.ctaLabel ?? `Choose ${plan.name}`}
            </Link>
          </Card>
        ))}
      </div>

      {mode === "full" ? (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-line text-slate-500">
                <th className="pb-3">Feature</th>
                {catalog.map((plan) => (
                  <th className="pb-3" key={plan.id}>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:not(:last-child)]:border-b [&_tr:not(:last-child)]:border-brand-line/70">
              <tr>
                <td className="py-4 font-medium text-brand-ink">Gallery limit</td>
                {catalog.map((plan) => (
                  <td key={`${plan.id}-gallery`}>{plan.limits.galleryLimit} images</td>
                ))}
              </tr>
              <tr>
                <td className="py-4 font-medium text-brand-ink">Bookings</td>
                {catalog.map((plan) => (
                  <td key={`${plan.id}-bookings`}>
                    {plan.limits.bookingsEnabledByDefault ? "Included" : "Admin controlled"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 font-medium text-brand-ink">Sponsored listings</td>
                {catalog.map((plan) => (
                  <td key={`${plan.id}-sponsored`}>
                    {plan.limits.sponsoredEligible ? "Eligible" : "Not included"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 font-medium text-brand-ink">Banner credits</td>
                {catalog.map((plan) => (
                  <td key={`${plan.id}-banner`}>{plan.limits.bannerCredits}</td>
                ))}
              </tr>
              <tr>
                <td className="py-4 font-medium text-brand-ink">Analytics tier</td>
                {catalog.map((plan) => (
                  <td key={`${plan.id}-analytics`}>{plan.limits.analyticsTier}</td>
                ))}
              </tr>
              <tr>
                <td className="py-4 font-medium text-brand-ink">Payments-ready</td>
                {catalog.map((plan) => (
                  <td key={`${plan.id}-payments`}>
                    {plan.limits.paymentGatewayReady ? "Ready for gateway rollout" : "Not yet"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}
