"use client";

import { useEffect, useState } from "react";

import type {
  AdminTownCreateInput,
  AdminTownUpdateInput
} from "@/lib/admin-schemas";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminCollection } from "@/hooks/use-admin-collection";
import {
  createTown,
  listTowns,
  saveTown,
  setTownStatus
} from "@/services/admin-service";
import type { Town } from "@/types";

function buildTownForm(): AdminTownCreateInput {
  return {
    name: "",
    province: "KwaZulu-Natal",
    country: "South Africa",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519583272095-6433daf26b6e?auto=format&fit=crop&w=1400&q=80"
  };
}

function toTownDraft(town: Town): AdminTownUpdateInput {
  return {
    id: town.id,
    name: town.name,
    province: town.province,
    country: town.country,
    heroImageUrl: town.heroImageUrl,
    isActive: town.isActive
  };
}

export default function AdminTownsPage() {
  const towns = useAdminCollection<Town>(listTowns);
  const [form, setForm] = useState<AdminTownCreateInput>(buildTownForm());
  const [drafts, setDrafts] = useState<Record<string, AdminTownUpdateInput>>({});
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [statusId, setStatusId] = useState("");

  useEffect(() => {
    setDrafts(Object.fromEntries(towns.items.map((town) => [town.id, toTownDraft(town)])));
  }, [towns.items]);

  function updateDraft(
    townId: string,
    updater: (town: AdminTownUpdateInput) => AdminTownUpdateInput
  ) {
    setDrafts((current) => {
      const town = current[townId];
      if (!town) return current;
      return {
        ...current,
        [townId]: updater(town)
      };
    });
  }

  async function handleCreateTown() {
    setCreating(true);
    try {
      await createTown(form);
      await towns.refresh();
      setForm(buildTownForm());
      setMessage("Town created successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create the town.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveTown(townId: string) {
    const town = drafts[townId];
    if (!town) return;

    setSavingId(townId);
    try {
      await saveTown(town);
      await towns.refresh();
      setMessage("Town updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update the town.");
    } finally {
      setSavingId("");
    }
  }

  async function toggleTown(town: Town) {
    setStatusId(town.id);
    try {
      await setTownStatus({
        id: town.id,
        isActive: !town.isActive
      });
      await towns.refresh();
      setMessage(town.isActive ? "Town disabled." : "Town enabled.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update the town status.");
    } finally {
      setStatusId("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Towns"
        description="Create, edit and enable towns for the multi-town rollout."
      />

      {message ? <Card className="text-sm text-brand-ink">{message}</Card> : null}

      <Card className="grid gap-3 md:grid-cols-2">
        <Input
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="New town name"
          value={form.name}
        />
        <Input
          onChange={(event) => setForm({ ...form, province: event.target.value })}
          placeholder="Province"
          value={form.province}
        />
        <Input
          onChange={(event) => setForm({ ...form, country: event.target.value })}
          placeholder="Country"
          value={form.country}
        />
        <Input
          onChange={(event) => setForm({ ...form, heroImageUrl: event.target.value })}
          placeholder="Hero image URL"
          value={form.heroImageUrl}
        />
        <div className="md:col-span-2 flex justify-end">
          <Button disabled={creating} onClick={() => void handleCreateTown()}>
            {creating ? "Creating..." : "Add town"}
          </Button>
        </div>
      </Card>

      {towns.loading ? <Card>Loading towns...</Card> : null}
      {towns.error ? <Card className="text-sm text-rose-600">{towns.error}</Card> : null}

      {!towns.loading && !towns.error ? (
        <div className="grid gap-4">
          {towns.items.map((town) => {
            const draft = drafts[town.id] ?? toTownDraft(town);

            return (
              <Card className="space-y-4" key={town.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-brand-ink">
                      {draft.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {draft.province}, {draft.country}
                    </p>
                  </div>
                  <Button
                    disabled={statusId === town.id}
                    onClick={() => void toggleTown(town)}
                    variant="outline"
                  >
                    {statusId === town.id
                      ? "Updating..."
                      : town.isActive
                        ? "Disable"
                        : "Enable"}
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    onChange={(event) =>
                      updateDraft(town.id, (current) => ({
                        ...current,
                        name: event.target.value
                      }))
                    }
                    value={draft.name}
                  />
                  <Input
                    onChange={(event) =>
                      updateDraft(town.id, (current) => ({
                        ...current,
                        province: event.target.value
                      }))
                    }
                    value={draft.province}
                  />
                  <Input
                    onChange={(event) =>
                      updateDraft(town.id, (current) => ({
                        ...current,
                        country: event.target.value
                      }))
                    }
                    value={draft.country}
                  />
                  <Input
                    onChange={(event) =>
                      updateDraft(town.id, (current) => ({
                        ...current,
                        heroImageUrl: event.target.value
                      }))
                    }
                    value={draft.heroImageUrl}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    disabled={savingId === town.id}
                    onClick={() => void handleSaveTown(town.id)}
                  >
                    {savingId === town.id ? "Saving..." : "Save town"}
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
