"use client";

import { useMemo } from "react";

import { BusinessProfileForm } from "@/components/forms/business-profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import { enforceBusinessSave } from "@/services/commercial-service";
import type {
  Business,
  Category,
  PaymentProviderSlug,
  Plan,
  PlatformSettings,
  Town
} from "@/types";
import { getCommercialStateForBusiness } from "@/utils/plan";
import { createId, slugify } from "@/utils/slug";

export default function EditBusinessPage() {
  const { user } = useAuth();
  const businesses = useManagedCollection<Business>("businesses");
  const categories = useManagedCollection<Category>("categories");
  const plans = useManagedCollection<Plan>("plans");
  const settings = useManagedCollection<PlatformSettings>("platform_settings");
  const towns = useManagedCollection<Town>("towns");
  const currentSettings = settings.items[0];
  const activeCategories = categories.items.filter((category) => category.isActive);
  const activeTowns = towns.items.filter((town) => town.isActive);
  const isLoading =
    businesses.loading || categories.loading || plans.loading || settings.loading || towns.loading;
  const loadError =
    businesses.error || categories.error || plans.error || settings.error || towns.error;

  const currentBusiness = useMemo(() => {
    const existing = businesses.items.find((business) => business.ownerId === user?.id);
    if (existing) return existing;

    return {
      id: createId("business"),
      ownerId: user?.id ?? "",
      businessName: `${user?.fullName ?? "New"} Business`,
      slug: slugify(`${user?.fullName ?? "new"} business`),
      shortDescription: "",
      description: "",
      logoUrl: "",
      coverImageUrl: "",
      galleryUrls: [],
      categoryId: activeCategories[0]?.id ?? "",
      subcategory: "",
      tags: [],
      phone: user?.phone ?? "",
      whatsappNumber: user?.whatsappNumber ?? "",
      email: user?.email ?? "",
      website: "",
      socialLinks: {},
      addressLine1: "",
      addressLine2: "",
      suburb: "",
      townId: user?.townId ?? activeTowns[0]?.id ?? "",
      province: user?.province ?? activeTowns[0]?.province ?? "KwaZulu-Natal",
      country: "South Africa",
      geo: {
        lat: -27.7695,
        lng: 30.7916
      },
      servicesEnabled: true,
      productsEnabled: true,
      bookingsEnabled: false,
      paymentsEnabled: false,
      deliveryEnabled: false,
      pickupEnabled: false,
      operatingHours: {
        monday: { open: "08:00", close: "17:00", closed: false },
        tuesday: { open: "08:00", close: "17:00", closed: false },
        wednesday: { open: "08:00", close: "17:00", closed: false },
        thursday: { open: "08:00", close: "17:00", closed: false },
        friday: { open: "08:00", close: "17:00", closed: false },
        saturday: { open: "09:00", close: "13:00", closed: false },
        sunday: { open: "09:00", close: "13:00", closed: true }
      },
      priceRange: "",
      featured: false,
      featuredUntil: "",
      verificationStatus: "pending",
      listingStatus: "draft",
      averageRating: 0,
      reviewCount: 0,
      subscriptionPlanId: "plan-free",
      subscriptionStatus: "none",
      leadFlowType: currentSettings?.leadFlowDefault ?? "whatsapp_first",
      allowInstantWhatsAppLead: true,
      sponsoredStatus: "none",
      priorityScore: 0,
      bannerCreditsUsed: 0,
      paymentProviderPreference: currentSettings?.supportedPaymentProviders?.[0] ?? "placeholder",
      viewsCount: 0,
      enquiriesCount: 0,
      bookingsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } satisfies Business;
  }, [
    activeCategories,
    activeTowns,
    businesses.items,
    currentSettings?.leadFlowDefault,
    currentSettings?.supportedPaymentProviders,
    user?.email,
    user?.fullName,
    user?.id,
    user?.phone,
    user?.whatsappNumber
  ]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit business listing"
          description="Update your listing, WhatsApp lead flow and commerce settings with plan-aware controls."
        />
        <Card>
          <p className="text-sm text-slate-600">Loading your business workspace...</p>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit business listing"
          description="Update your listing, WhatsApp lead flow and commerce settings with plan-aware controls."
        />
        <Card>
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      </div>
    );
  }

  if (!currentBusiness.id || (!activeCategories.length && !businesses.items.length) || (!activeTowns.length && !businesses.items.length)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit business listing"
          description="Update your listing, WhatsApp lead flow and commerce settings with plan-aware controls."
        />
        <EmptyState
          title="Platform setup incomplete"
          description="An admin needs to enable at least one town and category before a new business can be created."
        />
      </div>
    );
  }

  const commercialState = getCommercialStateForBusiness(currentBusiness, plans.items, currentSettings);
  const paymentProviders: PaymentProviderSlug[] = currentSettings?.supportedPaymentProviders?.length
    ? currentSettings.supportedPaymentProviders
    : ["placeholder"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit business listing"
        description="Update your listing, WhatsApp lead flow and commerce settings with plan-aware controls."
      />

      <Card>
        <BusinessProfileForm
          business={currentBusiness}
          categories={activeCategories}
          commercialState={commercialState}
          onSave={async (business) =>
            businesses.save(
              enforceBusinessSave(
                {
                  ...business,
                  slug: slugify(business.businessName || business.slug)
                },
                plans.items,
                currentSettings
              )
            )
          }
          paymentProviders={paymentProviders}
          towns={activeTowns}
        />
      </Card>
    </div>
  );
}
