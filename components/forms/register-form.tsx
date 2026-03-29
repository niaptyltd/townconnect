"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { isDemoModeEnabled, isFirebaseConfigured } from "@/firebase/config";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import { registerSchema } from "@/lib/schemas";
import type { RegisterInput, Town } from "@/types";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerAccount } = useAuth();
  const [error, setError] = useState("");
  const towns = useManagedCollection<Town>("towns");
  const availableTowns = towns.items.filter((town) => town.isActive);
  const backendUnavailable = !isFirebaseConfigured && !isDemoModeEnabled;

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      whatsappNumber: "",
      role: "customer",
      townId: "",
      province: "KwaZulu-Natal",
      createBusinessLater: true,
      referredByCode: ""
    }
  });

  const selectedTownId = form.watch("townId");

  useEffect(() => {
    if (!availableTowns.length) return;

    if (!form.getValues("townId")) {
      form.setValue("townId", availableTowns[0].id, { shouldValidate: true });
      form.setValue("province", availableTowns[0].province, { shouldValidate: true });
      return;
    }

    const selectedTown = availableTowns.find((town) => town.id === selectedTownId);
    if (selectedTown) {
      form.setValue("province", selectedTown.province, { shouldValidate: true });
    }
  }, [availableTowns, form, selectedTownId]);

  async function onSubmit(values: RegisterInput) {
    try {
      setError("");
      const user = await registerAccount(values);
      router.push(user.role === "business_owner" ? "/dashboard" : "/account");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to register.");
    }
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-brand-ink">Create your account</h1>
        <p className="text-sm text-slate-600">
          Join as a customer or business owner and get started in minutes.
        </p>
      </div>

      {backendUnavailable ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Registration is disabled until Firebase is configured or demo mode is explicitly enabled.
        </p>
      ) : null}

      {towns.error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{towns.error}</p>
      ) : null}

      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-ink">Full name</label>
          <Input {...form.register("fullName")} />
          <p className="text-xs text-rose-600">{form.formState.errors.fullName?.message}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-ink">Email</label>
            <Input {...form.register("email")} type="email" />
            <p className="text-xs text-rose-600">{form.formState.errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-ink">Password</label>
            <Input {...form.register("password")} type="password" />
            <p className="text-xs text-rose-600">{form.formState.errors.password?.message}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-ink">Phone</label>
            <Input {...form.register("phone")} />
            <p className="text-xs text-rose-600">{form.formState.errors.phone?.message}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-ink">WhatsApp number</label>
            <Input {...form.register("whatsappNumber")} />
            <p className="text-xs text-rose-600">{form.formState.errors.whatsappNumber?.message}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-ink">Role</label>
            <Select {...form.register("role")}>
              <option value="customer">Customer</option>
              <option value="business_owner">Business owner</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-ink">Town</label>
            <Select disabled={towns.loading || backendUnavailable || availableTowns.length === 0} {...form.register("townId")}>
              <option value="">
                {towns.loading ? "Loading towns..." : availableTowns.length === 0 ? "No active towns" : "Select a town"}
              </option>
              {availableTowns.map((town) => (
                <option key={town.id} value={town.id}>
                  {town.name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-slate-500">
              {towns.loading
                ? "Loading active towns from TownConnect."
                : availableTowns.length === 0
                  ? "Ask an admin to enable at least one active town before onboarding."
                  : "Your province is set automatically from the selected town."}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-ink">Referral code (optional)</label>
          <Input {...form.register("referredByCode")} placeholder="Enter referral code if you have one" />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-mist px-4 py-3">
          <input className="h-4 w-4" type="checkbox" {...form.register("createBusinessLater")} />
          <span className="text-sm text-brand-ink">
            If I'm a business owner, let me create my business listing later.
          </span>
        </label>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <Button
          disabled={backendUnavailable || towns.loading || availableTowns.length === 0}
          fullWidth
          type="submit"
        >
          {form.formState.isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-brand-emerald" href="/login">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
