"use client";

import { useEffect, useState } from "react";

import type { AdminPlanUpdateInput } from "@/lib/admin-schemas";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { useAdminCollection } from "@/hooks/use-admin-collection";
import { listPlans, savePlan } from "@/services/admin-service";
import type { Plan, PlanLimits, PlanSlug } from "@/types";
import { getDefaultPlanDefinition } from "@/utils/plan";

function toPlanDraft(plan: Plan): AdminPlanUpdateInput {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug as PlanSlug,
    price: plan.price,
    billingCycle: plan.billingCycle,
    features: plan.features,
    description: plan.description,
    highlightLabel: plan.highlightLabel,
    ctaLabel: plan.ctaLabel,
    recommended: plan.recommended ?? false,
    isActive: plan.isActive,
    sortOrder: plan.sortOrder,
    config: plan.config ?? getDefaultPlanDefinition(plan.slug as PlanSlug).limits
  };
}

function updatePlanConfig<K extends keyof PlanLimits>(
  plan: AdminPlanUpdateInput,
  key: K,
  value: PlanLimits[K]
) {
  return {
    ...plan,
    config: {
      ...plan.config,
      [key]: value
    }
  };
}

export default function AdminPlansPage() {
  const plans = useAdminCollection<Plan>(listPlans);
  const [drafts, setDrafts] = useState<Record<string, AdminPlanUpdateInput>>({});
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    setDrafts(
      Object.fromEntries(plans.items.map((plan) => [plan.id, toPlanDraft(plan)]))
    );
  }, [plans.items]);

  function updateDraft(planId: string, updater: (plan: AdminPlanUpdateInput) => AdminPlanUpdateInput) {
    setDrafts((current) => {
      const plan = current[planId];
      if (!plan) return current;
      return {
        ...current,
        [planId]: updater(plan)
      };
    });
  }

  async function persistPlan(planId: string) {
    const plan = drafts[planId];
    if (!plan) return;

    setSavingId(planId);
    try {
      await savePlan(plan);
      await plans.refresh();
      setMessage(`${plan.name} saved successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save the plan right now.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans"
        description="Manage pricing, feature restrictions, sponsored eligibility and payment-readiness by plan."
      />

      {message ? <Card className="text-sm text-brand-ink">{message}</Card> : null}

      {plans.loading ? <Card>Loading plan pricing and limits...</Card> : null}
      {plans.error ? <Card className="text-sm text-rose-600">{plans.error}</Card> : null}

      {!plans.loading && !plans.error ? (
        <div className="grid gap-4">
          {plans.items
            .slice()
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((plan) => {
              const draft = drafts[plan.id] ?? toPlanDraft(plan);
              const config = draft.config;

              return (
                <Card className="space-y-5" key={plan.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-2xl font-semibold text-brand-ink">
                      {draft.name}
                    </h2>
                    {draft.recommended ? <Badge variant="success">Recommended</Badge> : null}
                    <Badge variant={draft.isActive ? "success" : "warning"}>
                      {draft.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      onChange={(event) =>
                        updateDraft(plan.id, (current) => ({
                          ...current,
                          description: event.target.value
                        }))
                      }
                      placeholder="Plan description"
                      value={draft.description ?? ""}
                    />
                    <Input
                      min="0"
                      onChange={(event) =>
                        updateDraft(plan.id, (current) => ({
                          ...current,
                          price: Number(event.target.value)
                        }))
                      }
                      type="number"
                      value={draft.price}
                    />
                    <Input
                      onChange={(event) =>
                        updateDraft(plan.id, (current) => ({
                          ...current,
                          ctaLabel: event.target.value
                        }))
                      }
                      placeholder="CTA label"
                      value={draft.ctaLabel ?? ""}
                    />
                    <Input
                      onChange={(event) =>
                        updateDraft(plan.id, (current) => ({
                          ...current,
                          highlightLabel: event.target.value
                        }))
                      }
                      placeholder="Highlight label"
                      value={draft.highlightLabel ?? ""}
                    />
                  </div>

                  <Textarea
                    onChange={(event) =>
                      updateDraft(plan.id, (current) => ({
                        ...current,
                        features: event.target.value
                          .split("\n")
                          .map((item) => item.trim())
                          .filter(Boolean)
                      }))
                    }
                    placeholder="One feature per line"
                    value={draft.features.join("\n")}
                  />

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Input
                      min="0"
                      onChange={(event) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "galleryLimit", Number(event.target.value))
                        )
                      }
                      placeholder="Gallery limit"
                      type="number"
                      value={config.galleryLimit}
                    />
                    <Input
                      min="0"
                      onChange={(event) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "servicesLimit", Number(event.target.value))
                        )
                      }
                      placeholder="Services limit"
                      type="number"
                      value={config.servicesLimit}
                    />
                    <Input
                      min="0"
                      onChange={(event) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "productsLimit", Number(event.target.value))
                        )
                      }
                      placeholder="Products limit"
                      type="number"
                      value={config.productsLimit}
                    />
                    <Input
                      min="0"
                      onChange={(event) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "bannerCredits", Number(event.target.value))
                        )
                      }
                      placeholder="Banner credits"
                      type="number"
                      value={config.bannerCredits}
                    />
                    <Input
                      min="0"
                      onChange={(event) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "priorityRankBoost", Number(event.target.value))
                        )
                      }
                      placeholder="Priority boost"
                      type="number"
                      value={config.priorityRankBoost}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Select
                      onChange={(event) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(
                            current,
                            "analyticsTier",
                            event.target.value as PlanLimits["analyticsTier"]
                          )
                        )
                      }
                      value={config.analyticsTier}
                    >
                      <option value="basic">Basic analytics</option>
                      <option value="growth">Growth analytics</option>
                      <option value="advanced">Advanced analytics</option>
                    </Select>
                    <Select
                      onChange={(event) =>
                        updateDraft(plan.id, (current) => ({
                          ...current,
                          billingCycle: event.target.value as Plan["billingCycle"]
                        }))
                      }
                      value={draft.billingCycle}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </Select>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <Toggle
                      checked={draft.isActive}
                      label="Plan active"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) => ({ ...current, isActive: value }))
                      }
                    />
                    <Toggle
                      checked={draft.recommended}
                      label="Recommended"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) => ({ ...current, recommended: value }))
                      }
                    />
                    <Toggle
                      checked={config.featuredEligible}
                      label="Featured eligible"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "featuredEligible", value)
                        )
                      }
                    />
                    <Toggle
                      checked={config.sponsoredEligible}
                      label="Sponsored eligible"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "sponsoredEligible", value)
                        )
                      }
                    />
                    <Toggle
                      checked={config.advancedAnalytics}
                      label="Advanced analytics"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "advancedAnalytics", value)
                        )
                      }
                    />
                    <Toggle
                      checked={config.promotionalTools}
                      label="Promotional tools"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "promotionalTools", value)
                        )
                      }
                    />
                    <Toggle
                      checked={config.homepagePlacement}
                      label="Homepage placement"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "homepagePlacement", value)
                        )
                      }
                    />
                    <Toggle
                      checked={config.categoryBoost}
                      label="Category boost"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "categoryBoost", value)
                        )
                      }
                    />
                    <Toggle
                      checked={config.bookingsEnabledByDefault}
                      label="Bookings by default"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "bookingsEnabledByDefault", value)
                        )
                      }
                    />
                    <Toggle
                      checked={config.whatsappLeadCapture}
                      label="WhatsApp lead capture"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "whatsappLeadCapture", value)
                        )
                      }
                    />
                    <Toggle
                      checked={config.referralTracking}
                      label="Referral tracking"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "referralTracking", value)
                        )
                      }
                    />
                    <Toggle
                      checked={config.agentOnboarding}
                      label="Agent onboarding ready"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "agentOnboarding", value)
                        )
                      }
                    />
                    <Toggle
                      checked={config.paymentGatewayReady}
                      label="Payment gateway ready"
                      onChange={(value) =>
                        updateDraft(plan.id, (current) =>
                          updatePlanConfig(current, "paymentGatewayReady", value)
                        )
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      disabled={savingId === plan.id}
                      onClick={() => void persistPlan(plan.id)}
                    >
                      {savingId === plan.id ? "Saving..." : "Save plan"}
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
