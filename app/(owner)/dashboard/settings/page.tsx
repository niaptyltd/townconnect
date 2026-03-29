"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import { enforceBusinessSave } from "@/services/commercial-service";
import type { Business, Plan, PlatformSettings } from "@/types";
import { getCommercialStateForBusiness } from "@/utils/plan";

export default function OwnerSettingsPage() {
  const { user } = useAuth();
  const businesses = useManagedCollection<Business>("businesses");
  const plans = useManagedCollection<Plan>("plans");
  const settings = useManagedCollection<PlatformSettings>("platform_settings");

  const currentBusiness = useMemo(
    () => businesses.items.find((business) => business.ownerId === user?.id),
    [businesses.items, user?.id]
  );

  const currentSettings = settings.items[0];

  if (!currentBusiness) {
    return (
      <Card className="text-sm text-slate-600">Create your business listing first to access business settings.</Card>
    );
  }

  const commercialState = getCommercialStateForBusiness(currentBusiness, plans.items, currentSettings);

  async function updateSetting(partial: Partial<Business>) {
    if (!currentBusiness) return;

    await businesses.save(
      enforceBusinessSave(
        {
          ...currentBusiness,
          ...partial,
          updatedAt: new Date().toISOString()
        },
        plans.items,
        currentSettings
      )
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Business-level operational controls, WhatsApp lead routing and payment-ready placeholders."
      />

      <Card className="space-y-4">
        <p className="text-sm text-slate-600">{commercialState.upgradePrompt}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            onChange={(event) =>
              void updateSetting({ leadFlowType: event.target.value as Business["leadFlowType"] })
            }
            value={currentBusiness.leadFlowType ?? "whatsapp_first"}
          >
            <option value="whatsapp_first">WhatsApp first</option>
            <option value="hybrid">Hybrid</option>
            <option value="form_first">Form first</option>
          </Select>
          <Select
            onChange={(event) =>
              void updateSetting({
                paymentProviderPreference: event.target.value as Business["paymentProviderPreference"]
              })
            }
            value={currentBusiness.paymentProviderPreference ?? currentSettings?.supportedPaymentProviders?.[0] ?? "placeholder"}
          >
            {(currentSettings?.supportedPaymentProviders?.length
              ? currentSettings.supportedPaymentProviders
              : ["placeholder"]
            ).map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="grid gap-3">
        <Toggle
          checked={currentBusiness.bookingsEnabled}
          disabled={!commercialState.canUseBookings}
          label="Allow bookings"
          onChange={(value) => void updateSetting({ bookingsEnabled: value })}
        />
        <Toggle
          checked={currentBusiness.allowInstantWhatsAppLead !== false}
          disabled={!commercialState.config.whatsappLeadCapture}
          label="Use WhatsApp-first lead flow"
          onChange={(value) => void updateSetting({ allowInstantWhatsAppLead: value })}
        />
        <Toggle
          checked={currentBusiness.deliveryEnabled}
          label="Offer delivery"
          onChange={(value) => void updateSetting({ deliveryEnabled: value })}
        />
        <Toggle
          checked={currentBusiness.pickupEnabled}
          label="Offer pickup"
          onChange={(value) => void updateSetting({ pickupEnabled: value })}
        />
        <Toggle
          checked={currentBusiness.servicesEnabled}
          label="Show services"
          onChange={(value) => void updateSetting({ servicesEnabled: value })}
        />
        <Toggle
          checked={currentBusiness.productsEnabled}
          label="Show products"
          onChange={(value) => void updateSetting({ productsEnabled: value })}
        />
        <Toggle
          checked={currentBusiness.paymentsEnabled}
          disabled={!commercialState.config.paymentGatewayReady}
          label="Enable payments-ready mode"
          onChange={(value) => void updateSetting({ paymentsEnabled: value })}
        />
      </Card>

      <Card className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <p>Referral code: {currentBusiness.referralCode || "Not assigned yet"}</p>
        <p>Agent ID: {currentBusiness.agentId || "Self-serve onboarding"}</p>
        <p>Sponsored status: {currentBusiness.sponsoredStatus ?? "none"}</p>
        <p>Banner credits used: {currentBusiness.bannerCreditsUsed ?? 0}</p>
      </Card>
    </div>
  );
}
