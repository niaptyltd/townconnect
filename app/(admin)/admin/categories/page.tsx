"use client";

import { useEffect, useState } from "react";

import type {
  AdminCategoryCreateInput,
  AdminCategoryUpdateInput
} from "@/lib/admin-schemas";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminCollection } from "@/hooks/use-admin-collection";
import {
  createCategory,
  listCategories,
  saveCategory,
  setCategoryStatus
} from "@/services/admin-service";
import type { Category } from "@/types";

function buildCategoryForm(sortOrder: number): AdminCategoryCreateInput {
  return {
    name: "",
    icon: "briefcase",
    description: "New category",
    sortOrder
  };
}

function toCategoryDraft(category: Category): AdminCategoryUpdateInput {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: category.isActive
  };
}

export default function AdminCategoriesPage() {
  const categories = useAdminCollection<Category>(listCategories);
  const [form, setForm] = useState<AdminCategoryCreateInput>(buildCategoryForm(1));
  const [drafts, setDrafts] = useState<Record<string, AdminCategoryUpdateInput>>({});
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [statusId, setStatusId] = useState("");

  useEffect(() => {
    setDrafts(
      Object.fromEntries(categories.items.map((category) => [category.id, toCategoryDraft(category)]))
    );
    setForm((current) => buildCategoryForm(Math.max(categories.items.length + 1, current.sortOrder)));
  }, [categories.items]);

  function updateDraft(
    categoryId: string,
    updater: (category: AdminCategoryUpdateInput) => AdminCategoryUpdateInput
  ) {
    setDrafts((current) => {
      const category = current[categoryId];
      if (!category) return current;
      return {
        ...current,
        [categoryId]: updater(category)
      };
    });
  }

  async function handleCreateCategory() {
    setCreating(true);
    try {
      await createCategory(form);
      await categories.refresh();
      setMessage("Category created successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create the category.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveCategory(categoryId: string) {
    const category = drafts[categoryId];
    if (!category) return;

    setSavingId(categoryId);
    try {
      await saveCategory(category);
      await categories.refresh();
      setMessage("Category updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update the category.");
    } finally {
      setSavingId("");
    }
  }

  async function toggleCategory(category: Category) {
    setStatusId(category.id);
    try {
      await setCategoryStatus({
        id: category.id,
        isActive: !category.isActive
      });
      await categories.refresh();
      setMessage(category.isActive ? "Category disabled." : "Category enabled.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update the category status."
      );
    } finally {
      setStatusId("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage directory categories and sort ordering."
      />

      {message ? <Card className="text-sm text-brand-ink">{message}</Card> : null}

      <Card className="grid gap-3 md:grid-cols-2">
        <Input
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="New category name"
          value={form.name}
        />
        <Input
          onChange={(event) => setForm({ ...form, icon: event.target.value })}
          placeholder="Icon"
          value={form.icon}
        />
        <Textarea
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder="Description"
          value={form.description}
        />
        <Input
          min="1"
          onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })}
          placeholder="Sort order"
          type="number"
          value={form.sortOrder}
        />
        <div className="md:col-span-2 flex justify-end">
          <Button disabled={creating} onClick={() => void handleCreateCategory()}>
            {creating ? "Creating..." : "Add category"}
          </Button>
        </div>
      </Card>

      {categories.loading ? <Card>Loading categories...</Card> : null}
      {categories.error ? <Card className="text-sm text-rose-600">{categories.error}</Card> : null}

      {!categories.loading && !categories.error ? (
        <div className="grid gap-4">
          {categories.items.map((category) => {
            const draft = drafts[category.id] ?? toCategoryDraft(category);

            return (
              <Card className="space-y-4" key={category.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-brand-ink">
                      {draft.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Sort order: {draft.sortOrder}
                    </p>
                  </div>
                  <Button
                    disabled={statusId === category.id}
                    onClick={() => void toggleCategory(category)}
                    variant="outline"
                  >
                    {statusId === category.id
                      ? "Updating..."
                      : category.isActive
                        ? "Disable"
                        : "Enable"}
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    onChange={(event) =>
                      updateDraft(category.id, (current) => ({
                        ...current,
                        name: event.target.value
                      }))
                    }
                    value={draft.name}
                  />
                  <Input
                    onChange={(event) =>
                      updateDraft(category.id, (current) => ({
                        ...current,
                        icon: event.target.value
                      }))
                    }
                    value={draft.icon}
                  />
                  <Textarea
                    onChange={(event) =>
                      updateDraft(category.id, (current) => ({
                        ...current,
                        description: event.target.value
                      }))
                    }
                    value={draft.description}
                  />
                  <Input
                    min="1"
                    onChange={(event) =>
                      updateDraft(category.id, (current) => ({
                        ...current,
                        sortOrder: Number(event.target.value)
                      }))
                    }
                    type="number"
                    value={draft.sortOrder}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    disabled={savingId === category.id}
                    onClick={() => void handleSaveCategory(category.id)}
                  >
                    {savingId === category.id ? "Saving..." : "Save category"}
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
