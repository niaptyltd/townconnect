"use client";

import { useMemo } from "react";

import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Banner, BannerPlacement } from "@/types";

import { BannerStrip } from "@/components/sections/banner-strip";

function isBannerActive(
  banner: Banner,
  input: {
    placement: BannerPlacement;
    townId?: string;
    categoryId?: string;
  }
) {
  if (!banner.isActive || banner.placement !== input.placement) return false;
  if (banner.townId && banner.townId !== input.townId) return false;
  if (banner.categoryId && banner.categoryId !== input.categoryId) return false;

  const now = Date.now();
  const starts = new Date(banner.startDate).getTime();
  const ends = new Date(banner.endDate).getTime();
  return now >= starts && now <= ends;
}

export function ManagedBannerStrip(input: {
  placement: BannerPlacement;
  townId?: string;
  categoryId?: string;
}) {
  const banners = useManagedCollection<Banner>("banners");
  if (banners.loading || banners.error || banners.items.length === 0) {
    return null;
  }

  const items = useMemo(
    () =>
      banners.items
        .filter((banner) => isBannerActive(banner, input))
        .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0)),
    [banners.items, input]
  );

  return <BannerStrip items={items} />;
}
