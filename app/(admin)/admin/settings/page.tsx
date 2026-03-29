"use client";

import { useEffect, useState } from "react";

import type { AdminPlatformSettingsUpdateInput } from "@/lib/admin-schemas";
import { SUPPORTED_PAYMENT_PROVIDERS } from "@/constants/platform";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { useAdminCollection } from "@/hooks/use-admin-collection";
import { listSettings, saveSetting } from "@/services/admin-service";
import type { PlatformSettings } from "@/types";

function getSupportedProviderDraft(
  providers?: PlatformSettings["supportedPaymentProviders"]
): AdminPlatformSettingsUpdateInput["supportedPaymentProviders"] {
  const allowedProviders = new Set<string>(SUPPORTED_PAYMENT_PROVIDERS);
  const nextProviders = (providers ?? ["placeholder"]).filter((provider) =>
    allowedProviders.has(provider)
  ) as AdminPlatformSettingsUpdateInput["supportedPaymentProviders"];

  return nextProviders.length ? nextProviders : ["placeholder"];
}

function toSettingsDraft(settings: PlatformSettings): AdminPlatformSettingsUpdateInput {
  return {
    id: settings.id,
    currency: settings.currency,
    contactEmail: settings.contactEmail,
    whatsappSupport: settings.whatsappSupport,
    featuredBusinessLimit: settings.featuredBusinessLimit,
    sponsoredListingLimit: settings.sponsoredListingLimit ?? 0,
    allowSelfSignup: settings.allowSelfSignup,
    allowFreePlan: settings.allowFreePlan,
    allowSponsoredListings: settings.allowSponsoredListings ?? false,
    leadFlowDefault: settings.leadFlowDefault ?? "whatsapp_first",
    supportedPaymentProviders: getSupportedProviderDraft(settings.supportedPaymentProviders),
    featuredEligibilityRequiresVerification:
      settings.featuredEligibilityRequiresVerification ?? true,
    referralProgramEnabled: settings.referralProgramEnabled ?? false,
    agentCommissionEnabled: settings.agentCommissionEnabled ?? false
  };
}

export default function AdminSettingsPage() {
  const settings = useAdminCollection<PlatformSettings>(listSettings);
  const [draft, setDraft] = useState<AdminPlatformSettingsUpdateInput | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings.items[0]) {
      setDraft(toSettingsDraft(settings.items[0]));
    }
  }, [settings.items]);

  if (settings.loading) {
    return <Card>Loading platform settings...</Card>;
  }

  if (settings.error) {
    return <Card className="text-sm text-rose-600">{settings.error}</Card>;
  }

  if (!draft) {
    return <Card>No platform settings found.</Card>;
  }

  async function persistSettings() {
    if (!draft) return;

    setIsSaving(true);
    try {
      await saveSetting(draft);
      await settings.refresh();
      setMessage("Platform settings saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save platform settings right now."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform settings"
        description="Configure support details, lead routing defaults, sponsorship controls and payment-provider readiness."
      />

      {message ? <Card className="text-sm text-brand-ink">{message}</Card> : null}

      <Card className="grid gap-4 md:grid-cols-2">
        <Input
          onChange={(event) => setDraft({ ...draft, currency: event.target.value })}
          placeholder="Currency"
          value={draft.currency}
        />
        <Input
          onChange={(event) => setDraft({ ...draft, contactEmail: event.target.value })}
          placeholder="Contact email"
          value={draft.contactEmail}
        />
        <Input
          onChange={(event) => setDraft({ ...draft, whatsappSupport: event.target.value })}
          placeholder="WhatsApp support"
          value={draft.whatsappSupport}
        />
        <Input
          min="0"
          onChange={(event) =>
            setDraft({ ...draft, featuredBusinessLimit: Number(event.target.value) })
          }
          placeholder="Featured business limit"
          type="number"
          value={draft.featuredBusinessLimit}
        />
        <Input
          min="0"
          onChange={(event) =>
            setDraft({ ...draft, sponsoredListingLimit: Number(event.target.value) })
          }
          placeholder="Sponsored listing limit"
          type="number"
          value={draft.sponsoredListingLimit}
        />
        <Select
          onChange={(event) =>
            setDraft({
              ...draft,
              leadFlowDefault: event.target.value as AdminPlatformSettingsUpdateInput["leadFlowDefault"]
            })
          }
          value={draft.leadFlowDefault}
        >
          <option value="whatsapp_first">WhatsApp first</option>
          <option value="hybrid">Hybrid</option>
          <option value="form_first">Form first</option>
        </Select>
      </Card>

      <Card className="grid gap-3">
        <Toggle
          checked={draft.allowSelfSignup}
          label="Allow self-signup"
          onChange={(value) => setDraft({ ...draft, allowSelfSignup: value })}
        />
        <Toggle
          checked={draft.allowFreePlan}
          label="Allow free plan"
          onChange={(value) => setDraft({ ...draft, allowFreePlan: value })}
        />
        <Toggle
          checked={draft.allowSponsoredListings}
          label="Allow sponsored listings"
          onChange={(value) => setDraft({ ...draft, allowSponsoredListings: value })}
        />
        <Toggle
          checked={draft.featuredEligibilityRequiresVerification}
          label="Require verification for featured"
          onChange={(value) =>
            setDraft({ ...draft, featuredEligibilityRequiresVerification: value })
          }
        />
        <Toggle
          checked={draft.referralProgramEnabled}
          label="Referral program enabled"
          onChange={(value) => setDraft({ ...draft, referralProgramEnabled: value })}
        />
        <Toggle
          checked={draft.agentCommissionEnabled}
          label="Agent commission enabled"
          onChange={(value) => setDraft({ ...draft, agentCommissionEnabled: value })}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-heading text-2xl font-semibold text-brand-ink">
          Supported payment providers
        </h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {SUPPORTED_PAYMENT_PROVIDERS.map((provider) => (
            <Toggle
              checked={draft.supportedPaymentProviders.includes(provider)}
              key={provider}
              label={provider}
              onChange={(value) => {
                const next = new Set(draft.supportedPaymentProviders);
                if (value) {
                  next.add(provider);
                } else {
                  next.delete(provider);
                }

                setDraft({
                  ...draft,
                  supportedPaymentProviders: Array.from(next)
                });
              }}
            />
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button disabled={isSaving} onClick={() => void persistSettings()}>
          {isSaving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
