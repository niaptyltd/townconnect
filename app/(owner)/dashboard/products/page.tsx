"use client";

import { useMemo, useState } from "react";

import { ProductForm } from "@/components/forms/product-form";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import { assertProductCreationAllowed } from "@/services/commercial-service";
import type { Business, Plan, PlatformSettings, Product } from "@/types";
import { getCommercialStateForBusiness } from "@/utils/plan";
import { createId, slugify } from "@/utils/slug";

export default function OwnerProductsPage() {
  const { user } = useAuth();
  const businesses = useManagedCollection<Business>("businesses");
  const products = useManagedCollection<Product>("products");
  const plans = useManagedCollection<Plan>("plans");
  const settings = useManagedCollection<PlatformSettings>("platform_settings");
  const [message, setMessage] = useState("");

  const currentBusiness = useMemo(
    () => businesses.items.find((business) => business.ownerId === user?.id),
    [businesses.items, user?.id]
  );
  const isLoading =
    businesses.loading || products.loading || plans.loading || settings.loading;
  const loadError = businesses.error || products.error || plans.error || settings.error;

  const myProducts = useMemo(
    () => products.items.filter((item) => item.businessId === currentBusiness?.id),
    [currentBusiness?.id, products.items]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Products"
          description="Add products to support browsing, lead generation and future commerce flows."
        />
        <Card>
          <p className="text-sm text-slate-600">Loading your products workspace...</p>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Products"
          description="Add products to support browsing, lead generation and future commerce flows."
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
  const canAddMore = myProducts.length < commercialState.config.productsLimit;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Add products to support browsing, lead generation and future commerce flows."
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{commercialState.planName}</Badge>
          <Badge variant={canAddMore ? "success" : "warning"}>
            {myProducts.length}/{commercialState.config.productsLimit} used
          </Badge>
        </div>
        <p className="text-sm text-slate-600">{commercialState.upgradePrompt}</p>
        {message ? <p className="text-sm text-amber-700">{message}</p> : null}
        <ProductForm
          disabled={!canAddMore}
          initialValue={{
            id: createId("product"),
            businessId: currentBusiness.id,
            title: "",
            slug: "",
            description: "",
            price: 0,
            currency: "ZAR",
            imageUrl: currentBusiness.coverImageUrl,
            stockStatus: "in_stock",
            sku: createId("sku"),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }}
          onSave={async (product) => {
            try {
              assertProductCreationAllowed(
                currentBusiness,
                products.items,
                plans.items,
                settings.items[0]
              );
              await products.save({
                ...product,
                slug: slugify(product.title || product.slug)
              });
              setMessage("Product created.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Unable to create product.");
            }
          }}
          submitLabel={canAddMore ? "Create product" : "Upgrade to add more products"}
        />
      </Card>

      <div className="grid gap-4">
        {myProducts.length === 0 ? (
          <EmptyState description="Add products to make your listing more shoppable." title="No products yet" />
        ) : (
          myProducts.map((product) => (
            <Card className="space-y-4" key={product.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-brand-ink">{product.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{product.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{product.stockStatus.replace("_", " ")}</Badge>
                  <Button onClick={() => void products.remove(product.id)} variant="outline">
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
