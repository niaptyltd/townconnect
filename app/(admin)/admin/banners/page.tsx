"use client";

import { useEffect, useState } from "react";

import type {
  AdminBannerCreateInput,
  AdminBannerUpdateInput
} from "@/lib/admin-schemas";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminCollection } from "@/hooks/use-admin-collection";
import {
  createBanner,
  listBanners,
  listBusinesses,
  listCategories,
  listTowns,
  saveBanner,
  setBannerStatus
} from "@/services/admin-service";
import type { Banner, Business, Category, Town } from "@/types";

function buildDefaultBannerForm(): AdminBannerCreateInput {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 30);

  return {
    title: "",
    description: undefined,
    placement: "home_top",
    campaignType: "promotion",
    linkUrl: "/pricing",
    ctaLabel: "Learn more",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    sponsorBusinessId: undefined,
    townId: undefined,
    categoryId: undefined,
    priority: 0,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    isActive: true
  };
}

function toBannerDraft(banner: Banner): AdminBannerUpdateInput {
  return {
    id: banner.id,
    title: banner.title,
    description: banner.description,
    placement: banner.placement,
    campaignType: banner.campaignType ?? "promotion",
    linkUrl: banner.linkUrl,
    ctaLabel: banner.ctaLabel,
    imageUrl: banner.imageUrl,
    sponsorBusinessId: banner.sponsorBusinessId,
    townId: banner.townId,
    categoryId: banner.categoryId,
    priority: banner.priority ?? 0,
    startDate: banner.startDate,
    endDate: banner.endDate,
    isActive: banner.isActive
  };
}

export default function AdminBannersPage() {
  const banners = useAdminCollection<Banner>(listBanners);
  const businesses = useAdminCollection<Business>(listBusinesses);
  const towns = useAdminCollection<Town>(listTowns);
  const categories = useAdminCollection<Category>(listCategories);
  const [form, setForm] = useState<AdminBannerCreateInput>(buildDefaultBannerForm());
  const [drafts, setDrafts] = useState<Record<string, AdminBannerUpdateInput>>({});
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [statusId, setStatusId] = useState("");

  useEffect(() => {
    setDrafts(Object.fromEntries(banners.items.map((banner) => [banner.id, toBannerDraft(banner)])));
  }, [banners.items]);

  function updateDraft(
    bannerId: string,
    updater: (banner: AdminBannerUpdateInput) => AdminBannerUpdateInput
  ) {
    setDrafts((current) => {
      const banner = current[bannerId];
      if (!banner) return current;
      return {
        ...current,
        [bannerId]: updater(banner)
      };
    });
  }

  async function addBanner() {
    setCreating(true);
    try {
      await createBanner(form);
      await Promise.all([banners.refresh(), businesses.refresh()]);
      setForm(buildDefaultBannerForm());
      setMessage("Banner created successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create the banner.");
    } finally {
      setCreating(false);
    }
  }

  async function persistBanner(bannerId: string) {
    const banner = drafts[bannerId];
    if (!banner) return;

    setSavingId(bannerId);
    try {
      await saveBanner(banner);
      await Promise.all([banners.refresh(), businesses.refresh()]);
      setMessage("Banner updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update the banner.");
    } finally {
      setSavingId("");
    }
  }

  async function toggleBanner(banner: Banner) {
    setStatusId(banner.id);
    try {
      await setBannerStatus({ id: banner.id, isActive: !banner.isActive });
      await Promise.all([banners.refresh(), businesses.refresh()]);
      setMessage(banner.isActive ? "Banner disabled." : "Banner enabled.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update the banner status."
      );
    } finally {
      setStatusId("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Create promotional placements, sponsored creatives and banner inventory for search, town and business pages."
      />

      {message ? <Card className="text-sm text-brand-ink">{message}</Card> : null}

      <Card className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Banner title"
            value={form.title}
          />
          <Input
            onChange={(event) => setForm({ ...form, linkUrl: event.target.value })}
            placeholder="Link URL"
            value={form.linkUrl}
          />
          <Input
            onChange={(event) => setForm({ ...form, ctaLabel: event.target.value })}
            placeholder="CTA label"
            value={form.ctaLabel ?? ""}
          />
          <Input
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
            placeholder="Image URL"
            value={form.imageUrl}
          />
        </div>
        <Textarea
          onChange={(event) =>
            setForm({
              ...form,
              description: event.target.value || undefined
            })
          }
          placeholder="Banner description"
          value={form.description ?? ""}
        />
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            onChange={(event) =>
              setForm({
                ...form,
                placement: event.target.value as Banner["placement"]
              })
            }
            value={form.placement}
          >
            <option value="home_top">Home top</option>
            <option value="home_mid">Home mid</option>
            <option value="search_top">Search top</option>
            <option value="category">Category</option>
            <option value="town">Town</option>
            <option value="business_sidebar">Business sidebar</option>
          </Select>
          <Select
            onChange={(event) =>
              setForm({
                ...form,
                campaignType: event.target.value as NonNullable<Banner["campaignType"]>,
                sponsorBusinessId:
                  event.target.value === "sponsored_business" ? form.sponsorBusinessId : undefined
              })
            }
            value={form.campaignType}
          >
            <option value="promotion">Promotion</option>
            <option value="subscription">Subscription</option>
            <option value="partner">Partner</option>
            <option value="sponsored_business">Sponsored business</option>
          </Select>
          <Input
            min="0"
            onChange={(event) => setForm({ ...form, priority: Number(event.target.value) })}
            placeholder="Priority"
            type="number"
            value={form.priority}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            disabled={form.campaignType !== "sponsored_business"}
            onChange={(event) =>
              setForm({
                ...form,
                sponsorBusinessId: event.target.value || undefined
              })
            }
            value={form.sponsorBusinessId ?? ""}
          >
            <option value="">No sponsor business</option>
            {businesses.items.map((business) => (
              <option key={business.id} value={business.id}>
                {business.businessName}
              </option>
            ))}
          </Select>
          <Select
            onChange={(event) =>
              setForm({
                ...form,
                townId: event.target.value || undefined
              })
            }
            value={form.townId ?? ""}
          >
            <option value="">All towns</option>
            {towns.items.map((town) => (
              <option key={town.id} value={town.id}>
                {town.name}
              </option>
            ))}
          </Select>
          <Select
            onChange={(event) =>
              setForm({
                ...form,
                categoryId: event.target.value || undefined
              })
            }
            value={form.categoryId ?? ""}
          >
            <option value="">All categories</option>
            {categories.items.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end">
          <Button disabled={creating} onClick={() => void addBanner()}>
            {creating ? "Creating..." : "Add banner"}
          </Button>
        </div>
      </Card>

      {banners.loading || businesses.loading || towns.loading || categories.loading ? (
        <Card>Loading banner inventory...</Card>
      ) : null}
      {banners.error || businesses.error || towns.error || categories.error ? (
        <Card className="text-sm text-rose-600">
          {banners.error || businesses.error || towns.error || categories.error}
        </Card>
      ) : null}

      {!banners.loading &&
      !businesses.loading &&
      !towns.loading &&
      !categories.loading &&
      !banners.error &&
      !businesses.error &&
      !towns.error &&
      !categories.error ? (
        <div className="grid gap-4">
          {banners.items.map((banner) => {
            const draft = drafts[banner.id] ?? toBannerDraft(banner);

            return (
              <Card className="space-y-4" key={banner.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-brand-ink">
                      {draft.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {draft.placement} | {draft.campaignType ?? "promotion"} | priority{" "}
                      {draft.priority ?? 0}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Active from {new Date(draft.startDate).toLocaleDateString("en-ZA")} to{" "}
                      {new Date(draft.endDate).toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                  <Button
                    disabled={statusId === banner.id}
                    onClick={() => void toggleBanner(banner)}
                    variant="outline"
                  >
                    {statusId === banner.id
                      ? "Updating..."
                      : banner.isActive
                        ? "Disable"
                        : "Enable"}
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    onChange={(event) =>
                      updateDraft(banner.id, (current) => ({
                        ...current,
                        title: event.target.value
                      }))
                    }
                    value={draft.title}
                  />
                  <Input
                    onChange={(event) =>
                      updateDraft(banner.id, (current) => ({
                        ...current,
                        linkUrl: event.target.value
                      }))
                    }
                    value={draft.linkUrl}
                  />
                  <Input
                    onChange={(event) =>
                      updateDraft(banner.id, (current) => ({
                        ...current,
                        ctaLabel: event.target.value || undefined
                      }))
                    }
                    value={draft.ctaLabel ?? ""}
                  />
                  <Input
                    onChange={(event) =>
                      updateDraft(banner.id, (current) => ({
                        ...current,
                        imageUrl: event.target.value
                      }))
                    }
                    value={draft.imageUrl}
                  />
                </div>

                <Textarea
                  onChange={(event) =>
                    updateDraft(banner.id, (current) => ({
                      ...current,
                      description: event.target.value || undefined
                    }))
                  }
                  value={draft.description ?? ""}
                />

                <div className="grid gap-3 md:grid-cols-3">
                  <Select
                    onChange={(event) =>
                      updateDraft(banner.id, (current) => ({
                        ...current,
                        placement: event.target.value as Banner["placement"]
                      }))
                    }
                    value={draft.placement}
                  >
                    <option value="home_top">Home top</option>
                    <option value="home_mid">Home mid</option>
                    <option value="search_top">Search top</option>
                    <option value="category">Category</option>
                    <option value="town">Town</option>
                    <option value="business_sidebar">Business sidebar</option>
                  </Select>
                  <Select
                    onChange={(event) =>
                      updateDraft(banner.id, (current) => ({
                        ...current,
                        campaignType: event.target.value as NonNullable<Banner["campaignType"]>,
                        sponsorBusinessId:
                          event.target.value === "sponsored_business"
                            ? current.sponsorBusinessId
                            : undefined
                      }))
                    }
                    value={draft.campaignType}
                  >
                    <option value="promotion">Promotion</option>
                    <option value="subscription">Subscription</option>
                    <option value="partner">Partner</option>
                    <option value="sponsored_business">Sponsored business</option>
                  </Select>
                  <Input
                    min="0"
                    onChange={(event) =>
                      updateDraft(banner.id, (current) => ({
                        ...current,
                        priority: Number(event.target.value)
                      }))
                    }
                    type="number"
                    value={draft.priority}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <Select
                    disabled={draft.campaignType !== "sponsored_business"}
                    onChange={(event) =>
                      updateDraft(banner.id, (current) => ({
                        ...current,
                        sponsorBusinessId: event.target.value || undefined
                      }))
                    }
                    value={draft.sponsorBusinessId ?? ""}
                  >
                    <option value="">No sponsor business</option>
                    {businesses.items.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.businessName}
                      </option>
                    ))}
                  </Select>
                  <Select
                    onChange={(event) =>
                      updateDraft(banner.id, (current) => ({
                        ...current,
                        townId: event.target.value || undefined
                      }))
                    }
                    value={draft.townId ?? ""}
                  >
                    <option value="">All towns</option>
                    {towns.items.map((town) => (
                      <option key={town.id} value={town.id}>
                        {town.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    onChange={(event) =>
                      updateDraft(banner.id, (current) => ({
                        ...current,
                        categoryId: event.target.value || undefined
                      }))
                    }
                    value={draft.categoryId ?? ""}
                  >
                    <option value="">All categories</option>
                    {categories.items.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button
                    disabled={savingId === banner.id}
                    onClick={() => void persistBanner(banner.id)}
                  >
                    {savingId === banner.id ? "Saving..." : "Save banner"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
