"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import { searchSchema } from "@/lib/schemas";
import type { Category, Town } from "@/types";

type SearchFormValues = {
  keyword?: string;
  townSlug?: string;
  categorySlug?: string;
};

export function SearchForm({
  compact = false,
  categoryOptions,
  defaultValues,
  townOptions
}: {
  compact?: boolean;
  categoryOptions?: Category[];
  defaultValues?: SearchFormValues;
  townOptions?: Town[];
}) {
  const router = useRouter();
  const towns = useManagedCollection<Town>("towns");
  const categories = useManagedCollection<Category>("categories");
  const activeTowns = townOptions ?? towns.items.filter((town) => town.isActive);
  const activeCategories = categoryOptions ?? categories.items.filter((category) => category.isActive);
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues
  });

  return (
    <form
      className={`grid gap-3 ${compact ? "md:grid-cols-[minmax(0,1.8fr)_1fr_1fr_auto]" : "lg:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]"}`}
      onSubmit={form.handleSubmit((values) => {
        const params = new URLSearchParams();
        if (values.keyword) params.set("keyword", values.keyword);
        if (values.townSlug) params.set("town", values.townSlug);
        if (values.categorySlug) params.set("category", values.categorySlug);
        router.push(`/search?${params.toString()}`);
      })}
    >
      <Input {...form.register("keyword")} placeholder="Search businesses, services or products" />
      <Select
        disabled={townOptions ? false : towns.loading || !!towns.error}
        {...form.register("townSlug")}
      >
        <option value="">All towns</option>
        {activeTowns.map((town) => (
          <option key={town.id} value={town.slug}>
            {town.name}
          </option>
        ))}
      </Select>
      <Select
        disabled={categoryOptions ? false : categories.loading || !!categories.error}
        {...form.register("categorySlug")}
      >
        <option value="">All categories</option>
        {activeCategories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </Select>
      <Button type="submit">{compact ? "Search" : "Search TownConnect"}</Button>
      {!townOptions && (towns.error || categories.error) ? (
        <p className="text-sm text-rose-700 md:col-span-full">
          Search filters are temporarily unavailable. You can still search by keyword.
        </p>
      ) : null}
    </form>
  );
}
