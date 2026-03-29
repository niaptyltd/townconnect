"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Booking, Business } from "@/types";
import { formatDate } from "@/utils/format";

export default function AccountBookingsPage() {
  const { user } = useAuth();
  const bookings = useManagedCollection<Booking>("bookings");
  const businesses = useManagedCollection<Business>("businesses");

  const myBookings = useMemo(
    () =>
      bookings.items.filter(
        (item) => item.customerId === user?.id || item.customerEmail === user?.email
      ),
    [bookings.items, user?.email, user?.id]
  );

  if (bookings.loading || businesses.loading) {
    return <Card>Loading your bookings...</Card>;
  }

  if (bookings.error) {
    return <Card className="text-sm text-rose-700">{bookings.error}</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your bookings"
        description="Track booking requests you've made with local businesses."
      />

      {myBookings.length === 0 ? (
        <EmptyState
          description="You haven't requested any bookings yet. Explore businesses and submit your first booking request."
          title="No bookings yet"
        />
      ) : (
        <div className="grid gap-4">
          {myBookings.map((booking) => (
            <Card className="space-y-3" key={booking.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-brand-ink">
                    {businesses.items.find((business) => business.id === booking.businessId)?.businessName ??
                      "Business"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatDate(booking.requestedDate)} at {booking.requestedTime}
                  </p>
                </div>
                <Badge
                  variant={
                    booking.status === "accepted"
                      ? "success"
                      : booking.status === "declined" || booking.status === "cancelled"
                        ? "danger"
                        : "warning"
                  }
                >
                  {booking.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{booking.notes}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
