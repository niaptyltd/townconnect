"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEMO_LOGINS } from "@/constants/platform";
import { isDemoModeEnabled, isFirebaseConfigured } from "@/firebase/config";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema } from "@/lib/schemas";
import type { LoginInput } from "@/types";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const reason = searchParams.get("reason");
  const { login } = useAuth();
  const [error, setError] = useState("");
  const backendUnavailable = !isFirebaseConfigured && !isDemoModeEnabled;
  const reasonMessage =
    reason === "session_expired"
      ? "Your session expired. Sign in again to continue."
      : reason === "forbidden"
        ? "You do not have permission to access that page."
        : "";

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: isDemoModeEnabled ? "owner@townconnect.co.za" : "",
      password: isDemoModeEnabled ? "TownConnect123!" : ""
    }
  });

  async function onSubmit(values: LoginInput) {
    try {
      setError("");
      const user = await login(values);
      router.push(
        next ?? (user.role === "admin" ? "/admin" : user.role === "business_owner" ? "/dashboard" : "/account")
      );
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to sign in.");
    }
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-brand-ink">Welcome back</h1>
        <p className="text-sm text-slate-600">
          Sign in to manage your account, business listing or admin tools.
        </p>
      </div>

      {reasonMessage ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{reasonMessage}</p>
      ) : null}

      {backendUnavailable ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Sign-in is disabled until Firebase is configured or demo mode is explicitly enabled.
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-ink">Email</label>
          <Input {...form.register("email")} placeholder="you@example.com" type="email" />
          <p className="text-xs text-rose-600">{form.formState.errors.email?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-ink">Password</label>
          <Input {...form.register("password")} placeholder="Password" type="password" />
          <p className="text-xs text-rose-600">{form.formState.errors.password?.message}</p>
        </div>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <Button disabled={backendUnavailable} fullWidth type="submit">
          {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {isDemoModeEnabled ? (
        <div className="rounded-[1.25rem] bg-brand-sand/70 p-4">
          <p className="text-sm font-semibold text-brand-ink">Demo logins</p>
          <div className="mt-3 grid gap-2">
            {DEMO_LOGINS.map((item) => (
              <button
                className="rounded-2xl border border-brand-line bg-white px-4 py-3 text-left text-sm"
                key={item.email}
                onClick={() => {
                  form.setValue("email", item.email);
                  form.setValue("password", item.password);
                }}
                type="button"
              >
                <span className="block font-medium text-brand-ink">{item.label}</span>
                <span className="block text-slate-500">{item.email}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-sm text-slate-600">
        New to TownConnect?{" "}
        <Link className="font-semibold text-brand-emerald" href="/register">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
