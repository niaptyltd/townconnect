"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function OwnerProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" description="Your owner account details and role assignment." />

      <Card className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
        <p>
          <span className="font-semibold text-brand-ink">Full name:</span> {user?.fullName}
        </p>
        <p>
          <span className="font-semibold text-brand-ink">Email:</span> {user?.email}
        </p>
        <p>
          <span className="font-semibold text-brand-ink">Phone:</span> {user?.phone}
        </p>
        <p>
          <span className="font-semibold text-brand-ink">WhatsApp:</span> {user?.whatsappNumber}
        </p>
      </Card>
    </div>
  );
}
