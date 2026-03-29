"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Booking, Enquiry } from "@/types";

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const bookings = useManagedCollection<Booking>("bookings");
  const enquiries = useManagedCollection<Enquiry>("enquiries");

  const myBookings = useMemo(
    () => bookings.items.filter((item) => item.customerId === user?.id || item.customerEmail === user?.email),
    [bookings.items, user?.email, user?.id]
  );
  const myEnquiries = useMemo(
    () => enquiries.items.filter((item) => item.customerId === user?.id || item.email === user?.email),
    [enquiries.items, user?.email, user?.id]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account overview"
        description="Keep track of your bookings, enquiries and profile details from one place."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard detail="Requests you’ve made to businesses" label="Bookings" value={myBookings.length} />
        <StatCard detail="Messages sent through listings" label="Enquiries" value={myEnquiries.length} />
        <StatCard detail="Role-based access is active" label="Account role" value={user?.role ?? "customer"} />
      </div>

      <Card className="space-y-3">
        <h2 className="font-heading text-2xl font-semibold text-brand-ink">Profile snapshot</h2>
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-semibold text-brand-ink">Name:</span> {user?.fullName}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Email:</span> {user?.email}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Phone:</span> {user?.phone}
          </p>
          <p>
            <span className="font-semibold text-brand-ink">Town:</span> {user?.townId}
          </p>
        </div>
      </Card>
    </div>
  );
}
