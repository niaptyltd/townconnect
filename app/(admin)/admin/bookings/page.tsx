"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Booking } from "@/types";

export default function AdminBookingsPage() {
  const bookings = useManagedCollection<Booking>("bookings");

  if (bookings.loading) {
    return <Card>Loading bookings...</Card>;
  }

  if (bookings.error) {
    return <Card className="text-sm text-rose-700">{bookings.error}</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="View all platform bookings in one place." />
      {bookings.items.length === 0 ? (
        <EmptyState description="Bookings will appear here as customers start requesting services." title="No bookings yet" />
      ) : (
        <div className="grid gap-4">
          {bookings.items.map((booking) => (
            <Card className="space-y-3" key={booking.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-brand-ink">{booking.customerName}</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {booking.requestedDate} at {booking.requestedTime}
                  </p>
                </div>
                <Badge>{booking.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
