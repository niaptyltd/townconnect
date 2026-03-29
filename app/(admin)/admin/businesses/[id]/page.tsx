"use client";

import { useEffect, useMemo, useState } from "react";

import type { AdminSubscriptionUpdateInput } from "@/lib/admin-schemas";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAdminCollection } from "@/hooks/use-admin-collection";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import {
  listBusinesses,
  listPlans,
  listSettings,
  listSubscriptions,
  saveSubscription
} from "@/services/admin-service";
import type { Booking, Business, Enquiry, Plan, PlatformSettings, Subscription } from "@/types";
import { getCommercialStateForBusiness } from "@/utils/plan";

function getSupportedSubscriptionProviders(
  settings: PlatformSettings | undefined
): AdminSubscriptionUpdateInput["providerSlug"][] {
  const allowedProviders = new Set(["placeholder", "payfast", "yoco", "ozow"]);
  const nextProviders = (settings?.supportedPaymentProviders ?? ["placeholder"]).filter((provider) =>
    allowedProviders.has(provider)
  ) as AdminSubscriptionUpdateInput["providerSlug"][];

  return nextProviders.length ? nextProviders : ["placeholder"];
}

function toDateInput(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toIsoDate(value: string, endOfDay = false) {
  return `${value}${endOfDay ? "T23:59:59.000Z" : "T00:00:00.000Z"}`;
}

function buildSubscriptionDraft(
  business: Business,
  subscription: Subscription | undefined,
  settings: PlatformSettings | undefined
): AdminSubscriptionUpdateInput {
  const startDate =
    subscription?.startsAt ??
    new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const endDate =
    subscription?.endsAt ??
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

  return {
    businessId: business.id,
    subscriptionId: subscription?.id,
    planId: subscription?.planId ?? business.subscriptionPlanId ?? "plan-free",
    status:
      subscription?.status ??
      (business.subscriptionStatus === "none" ? "trial" : business.subscriptionStatus),
    billingCycle: subscription?.billingCycle ?? "monthly",
    startsAt: startDate,
    endsAt: endDate,
    providerSlug:
      getSupportedSubscriptionProviders(settings).find(
        (provider) => provider === subscription?.providerSlug
      ) ?? getSupportedSubscriptionProviders(settings)[0],
    paymentStatus: subscription?.paymentStatus ?? "mocked"
  };
}

export default function AdminBusinessDetailPage({ params }: { params: { id: string } }) {
  const businesses = useAdminCollection<Business>(listBusinesses);
  const subscriptions = useAdminCollection<Subscription>(listSubscriptions);
  const plans = useAdminCollection<Plan>(listPlans);
  const settings = useAdminCollection<PlatformSettings>(listSettings);
  const bookings = useManagedCollection<Booking>("bookings");
  const enquiries = useManagedCollection<Enquiry>("enquiries");
  const [subscriptionDraft, setSubscriptionDraft] =
    useState<AdminSubscriptionUpdateInput | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const business = useMemo(
    () => businesses.items.find((item) => item.id === params.id),
    [businesses.items, params.id]
  );
  const currentSubscription = useMemo(
    () => subscriptions.items.find((item) => item.businessId === params.id),
    [params.id, subscriptions.items]
  );

  useEffect(() => {
    if (business) {
      setSubscriptionDraft(
        buildSubscriptionDraft(business, currentSubscription, settings.items[0])
      );
    }
  }, [business, currentSubscription, settings.items]);

  if (businesses.loading || subscriptions.loading || plans.loading || settings.loading) {
    return <Card>Loading business moderation detail...</Card>;
  }

  if (businesses.error || subscriptions.error || plans.error || settings.error) {
    return (
      <Card className="text-sm text-rose-600">
        {businesses.error || subscriptions.error || plans.error || settings.error}
      </Card>
    );
  }

  if (!business) {
    return <Card>Business not found.</Card>;
  }

  const commercialState = getCommercialStateForBusiness(business, plans.items, settings.items[0]);

  async function persistSubscription() {
    if (!subscriptionDraft) return;

    setIsSaving(true);
    try {
      await saveSubscription(subscriptionDraft);
      await Promise.all([subscriptions.refresh(), businesses.refresh()]);
      setMessage("Subscription updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update the subscription."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={business.businessName}
        description="Detailed moderation view for a single business."
      />

      {message ? <Card className="text-sm text-brand-ink">{message}</Card> : null}

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{business.listingStatus}</Badge>
          <Badge>{business.verificationStatus}</Badge>
          <Badge>{commercialState.planName}</Badge>
          <Badge>{business.sponsoredStatus ?? "none"}</Badge>
        </div>
        <p className="text-sm leading-6 text-slate-600">{business.description}</p>
        <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-semibold text-brand-ink">Email:</span> {business.email}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Phone:</span> {business.phone}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Town:</span> {business.townId}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Category:</span> {business.categoryId}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Lead flow:</span>{" "}
            {business.leadFlowType ?? "whatsapp_first"}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Payment provider:</span>{" "}
            {business.paymentProviderPreference ?? "placeholder"}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Referral code:</span>{" "}
            {business.referralCode || "not set"}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Agent:</span>{" "}
            {business.agentId || "self-serve"}
          </p>
        </div>
      </Card>

      {subscriptionDraft ? (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-brand-ink">
                Subscription controls
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Update plan, billing state and provider settings through the secure admin path.
              </p>
            </div>
            <Badge>{currentSubscription?.status ?? business.subscriptionStatus}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  planId: event.target.value
                })
              }
              value={subscriptionDraft.planId}
            >
              {plans.items.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </Select>
            <Select
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  status: event.target.value as Subscription["status"]
                })
              }
              value={subscriptionDraft.status}
            >
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  billingCycle: event.target.value as Subscription["billingCycle"]
                })
              }
              value={subscriptionDraft.billingCycle}
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </Select>
            <Select
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  providerSlug: event.target.value as AdminSubscriptionUpdateInput["providerSlug"]
                })
              }
              value={subscriptionDraft.providerSlug}
            >
              {getSupportedSubscriptionProviders(settings.items[0]).map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </Select>
            <Input
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  startsAt: toIsoDate(event.target.value)
                })
              }
              type="date"
              value={toDateInput(subscriptionDraft.startsAt)}
            />
            <Input
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  endsAt: toIsoDate(event.target.value, true)
                })
              }
              type="date"
              value={toDateInput(subscriptionDraft.endsAt)}
            />
            <Select
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  paymentStatus: event.target.value as NonNullable<Subscription["paymentStatus"]>
                })
              }
              value={subscriptionDraft.paymentStatus}
            >
              <option value="mocked">Mocked</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button disabled={isSaving} onClick={() => void persistSubscription()}>
              {isSaving ? "Saving..." : "Save subscription"}
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h2 className="font-heading text-2xl font-semibold text-brand-ink">Bookings</h2>
          <p className="mt-3 text-sm text-slate-600">
            {bookings.loading
              ? "Loading booking records..."
              : `${bookings.items.filter((item) => item.businessId === business.id).length} booking records.`}
          </p>
        </Card>
        <Card>
          <h2 className="font-heading text-2xl font-semibold text-brand-ink">Enquiries</h2>
          <p className="mt-3 text-sm text-slate-600">
            {enquiries.loading
              ? "Loading enquiry records..."
              : `${enquiries.items.filter((item) => item.businessId === business.id).length} enquiry records.`}
          </p>
        </Card>
      </div>
    </div>
  );
}
