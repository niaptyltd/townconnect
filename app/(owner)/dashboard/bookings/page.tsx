"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Booking, Business } from "@/types";

export default function OwnerBookingsPage() {
  const { user } = useAuth();
  const businesses = useManagedCollection<Business>("businesses");
  const bookings = useManagedCollection<Booking>("bookings");
  const [filter, setFilter] = useState<Booking["status"] | "all">("all");

  const businessIds = useMemo(
    () => businesses.items.filter((business) => business.ownerId === user?.id).map((business) => business.id),
    [businesses.items, user?.id]
  );

  const myBookings = useMemo(
    () =>
      bookings.items.filter(
        (item) => businessIds.includes(item.businessId) && (filter === "all" || item.status === filter)
      ),
    [bookings.items, businessIds, filter]
  );

  async function updateStatus(booking: Booking, status: Booking["status"]) {
    await bookings.save({
      ...booking,
      status,
      updatedAt: new Date().toISOString()
    });
  }

  if (businesses.loading || bookings.loading) {
    return <Card>Loading your bookings...</Card>;
  }

  if (bookings.error) {
    return <Card className="text-sm text-rose-700">{bookings.error}</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Review requests and update statuses for your business." />

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "accepted", "declined", "completed", "cancelled"].map((value) => (
          <button
            className={`rounded-full px-4 py-2 text-sm ${
              filter === value ? "bg-brand-forest text-white" : "bg-brand-sand text-brand-ink"
            }`}
            key={value}
            onClick={() => setFilter(value as Booking["status"] | "all")}
            type="button"
          >
            {value}
          </button>
        ))}
      </div>

      {myBookings.length === 0 ? (
        <EmptyState description="No bookings match the current filter." title="No bookings yet" />
      ) : (
        <div className="grid gap-4">
          {myBookings.map((booking) => (
            <Card className="space-y-4" key={booking.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-brand-ink">{booking.customerName}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {booking.requestedDate} at {booking.requestedTime}
                  </p>
                </div>
                <Badge>{booking.status}</Badge>
              </div>
              <p className="text-sm text-slate-600">{booking.notes}</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void updateStatus(booking, "accepted")} variant="outline">
                  Accept
                </Button>
                <Button onClick={() => void updateStatus(booking, "declined")} variant="outline">
                  Decline
                </Button>
                <Button onClick={() => void updateStatus(booking, "completed")} variant="outline">
                  Mark complete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
