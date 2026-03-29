"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import type {
  Business,
  BusinessCommercialState,
  Category,
  PaymentProviderSlug,
  Town
} from "@/types";

export function BusinessProfileForm({
  business,
  categories,
  commercialState,
  paymentProviders,
  towns,
  onSave
}: {
  business: Business;
  categories: Category[];
  commercialState: BusinessCommercialState;
  paymentProviders: PaymentProviderSlug[];
  towns: Town[];
  onSave: (business: Business) => Promise<void>;
}) {
  const [form, setForm] = useState(business);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(business);
  }, [business]);

  async function submit() {
    await onSave({
      ...form,
      updatedAt: new Date().toISOString()
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-3xl bg-brand-mist p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{commercialState.planName}</Badge>
          <Badge variant={commercialState.canBeFeatured ? "success" : "warning"}>
            {commercialState.canBeFeatured ? "Featured eligible" : "Featured locked"}
          </Badge>
          <Badge variant={commercialState.canBeSponsored ? "success" : "warning"}>
            {commercialState.canBeSponsored ? "Sponsored eligible" : "Sponsored locked"}
          </Badge>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <p>Gallery limit: {commercialState.maxGalleryImages} images</p>
          <p>Analytics tier: {commercialState.config.analyticsTier}</p>
          <p>Banner credits: {commercialState.config.bannerCredits}</p>
          <p>Priority boost: {commercialState.config.priorityRankBoost}</p>
        </div>
        <p className="mt-3 text-sm text-brand-ink">{commercialState.upgradePrompt}</p>
      </div>

      <Input
        onChange={(event) => setForm({ ...form, businessName: event.target.value })}
        placeholder="Business name"
        value={form.businessName}
      />
      <Input
        onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
        placeholder="Short description"
        value={form.shortDescription}
      />
      <Textarea
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        placeholder="Full business description"
        value={form.description}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
          value={form.categoryId}
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          onChange={(event) => {
            const selectedTown = towns.find((town) => town.id === event.target.value);
            setForm({
              ...form,
              townId: event.target.value,
              province: selectedTown?.province ?? form.province
            });
          }}
          value={form.townId}
        >
          <option value="">Select town</option>
          {towns.map((town) => (
            <option key={town.id} value={town.id}>
              {town.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          placeholder="Phone"
          value={form.phone}
        />
        <Input
          onChange={(event) => setForm({ ...form, whatsappNumber: event.target.value })}
          placeholder="WhatsApp"
          value={form.whatsappNumber}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="Email"
          value={form.email}
        />
        <Input
          onChange={(event) => setForm({ ...form, website: event.target.value })}
          placeholder="Website"
          value={form.website}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          onChange={(event) => setForm({ ...form, addressLine1: event.target.value })}
          placeholder="Address line 1"
          value={form.addressLine1}
        />
        <Input
          onChange={(event) => setForm({ ...form, suburb: event.target.value })}
          placeholder="Suburb"
          value={form.suburb}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          onChange={(event) =>
            setForm({ ...form, leadFlowType: event.target.value as Business["leadFlowType"] })
          }
          value={form.leadFlowType ?? "whatsapp_first"}
        >
          <option value="whatsapp_first">WhatsApp first</option>
          <option value="hybrid">Hybrid lead flow</option>
          <option value="form_first">Form first</option>
        </Select>
        <Select
          onChange={(event) =>
            setForm({
              ...form,
              paymentProviderPreference: event.target.value as PaymentProviderSlug
            })
          }
          value={form.paymentProviderPreference ?? paymentProviders[0] ?? "placeholder"}
        >
          {paymentProviders.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input placeholder="Referral code" readOnly value={form.referralCode ?? ""} />
        <Input placeholder="Assigned agent" readOnly value={form.agentId ?? ""} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Toggle
          checked={form.servicesEnabled}
          label="Services enabled"
          onChange={(value) => setForm({ ...form, servicesEnabled: value })}
        />
        <Toggle
          checked={form.productsEnabled}
          label="Products enabled"
          onChange={(value) => setForm({ ...form, productsEnabled: value })}
        />
        <Toggle
          checked={form.bookingsEnabled}
          disabled={!commercialState.canUseBookings}
          label="Bookings enabled"
          onChange={(value) => setForm({ ...form, bookingsEnabled: value })}
        />
        <Toggle
          checked={form.allowInstantWhatsAppLead !== false}
          disabled={!commercialState.config.whatsappLeadCapture}
          label="WhatsApp-first leads"
          onChange={(value) => setForm({ ...form, allowInstantWhatsAppLead: value })}
        />
        <Toggle
          checked={form.deliveryEnabled}
          label="Delivery enabled"
          onChange={(value) => setForm({ ...form, deliveryEnabled: value })}
        />
        <Toggle
          checked={form.pickupEnabled}
          label="Pickup enabled"
          onChange={(value) => setForm({ ...form, pickupEnabled: value })}
        />
        <Toggle
          checked={form.paymentsEnabled}
          disabled={!commercialState.config.paymentGatewayReady}
          label="Payments-ready toggle"
          onChange={(value) => setForm({ ...form, paymentsEnabled: value })}
        />
      </div>

      <p className="text-sm text-slate-600">
        Featured placement, sponsored visibility and banner campaigns stay under plan eligibility and admin control.
      </p>
      {saved ? <p className="text-sm text-emerald-700">Business profile saved.</p> : null}
      <Button onClick={() => void submit()}>Save changes</Button>
    </div>
  );
}
