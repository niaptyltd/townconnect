"use client";

import { useMemo, useState } from "react";

import { ServiceForm } from "@/components/forms/service-form";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import { assertServiceCreationAllowed } from "@/services/commercial-service";
import type { Business, Plan, PlatformSettings, Service } from "@/types";
import { getCommercialStateForBusiness } from "@/utils/plan";
import { createId, slugify } from "@/utils/slug";

export default function OwnerServicesPage() {
  const { user } = useAuth();
  const businesses = useManagedCollection<Business>("businesses");
  const services = useManagedCollection<Service>("services");
  const plans = useManagedCollection<Plan>("plans");
  const settings = useManagedCollection<PlatformSettings>("platform_settings");
  const [message, setMessage] = useState("");

  const currentBusiness = useMemo(
    () => businesses.items.find((business) => business.ownerId === user?.id),
    [businesses.items, user?.id]
  );
  const isLoading =
    businesses.loading || services.loading || plans.loading || settings.loading;
  const loadError = businesses.error || services.error || plans.error || settings.error;

  const myServices = useMemo(
    () => services.items.filter((item) => item.businessId === currentBusiness?.id),
    [currentBusiness?.id, services.items]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Services"
          description="Create and manage the services customers can enquire about or book."
        />
        <Card>
          <p className="text-sm text-slate-600">Loading your services workspace...</p>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Services"
          description="Create and manage the services customers can enquire about or book."
        />
        <Card>
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      </div>
    );
  }

  if (!currentBusiness) {
    return <EmptyState description="Create your business listing first." title="No business yet" />;
  }

  const commercialState = getCommercialStateForBusiness(currentBusiness, plans.items, settings.items[0]);
  const canAddMore = myServices.length < commercialState.config.servicesLimit;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Create and manage the services customers can enquire about or book."
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{commercialState.planName}</Badge>
          <Badge variant={canAddMore ? "success" : "warning"}>
            {myServices.length}/{commercialState.config.servicesLimit} used
          </Badge>
        </div>
        <p className="text-sm text-slate-600">{commercialState.upgradePrompt}</p>
        {message ? <p className="text-sm text-amber-700">{message}</p> : null}
        <ServiceForm
          disabled={!canAddMore}
          initialValue={{
            id: createId("service"),
            businessId: currentBusiness.id,
            title: "",
            slug: "",
            description: "",
            price: 0,
            currency: "ZAR",
            durationMinutes: 60,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }}
          onSave={async (service) => {
            try {
              assertServiceCreationAllowed(
                currentBusiness,
                services.items,
                plans.items,
                settings.items[0]
              );
              await services.save({
                ...service,
                slug: slugify(service.title || service.slug)
              });
              setMessage("Service created.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Unable to create service.");
            }
          }}
          submitLabel={canAddMore ? "Create service" : "Upgrade to add more services"}
        />
      </Card>

      <div className="grid gap-4">
        {myServices.length === 0 ? (
          <EmptyState description="Add your first service to start taking bookings and enquiries." title="No services yet" />
        ) : (
          myServices.map((service) => (
            <Card className="space-y-4" key={service.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-brand-ink">{service.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{service.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success">{service.durationMinutes} min</Badge>
                  <Button onClick={() => void services.remove(service.id)} variant="outline">
                    Archive
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
