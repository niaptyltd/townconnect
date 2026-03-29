"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminCollection } from "@/hooks/use-admin-collection";
import { StatCard } from "@/components/ui/stat-card";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import { listBusinesses, listSubscriptions, listUsers } from "@/services/admin-service";
import type { Booking, Business, Enquiry, Subscription, UserProfile } from "@/types";

export default function AdminOverviewPage() {
  const businesses = useAdminCollection<Business>(listBusinesses);
  const users = useAdminCollection<UserProfile>(listUsers);
  const bookings = useManagedCollection<Booking>("bookings");
  const enquiries = useManagedCollection<Enquiry>("enquiries");
  const subscriptions = useAdminCollection<Subscription>(listSubscriptions);

  const activeBusinesses = businesses.items.filter((business) => business.listingStatus === "active").length;
  const pendingVerifications = businesses.items.filter(
    (business) => business.verificationStatus === "pending"
  ).length;
  const recentSignups = users.items.slice(0, 4);

  if (
    businesses.loading ||
    users.loading ||
    bookings.loading ||
    enquiries.loading ||
    subscriptions.loading
  ) {
    return <Card>Loading admin overview...</Card>;
  }

  if (businesses.error || users.error || bookings.error || enquiries.error || subscriptions.error) {
    return (
      <Card className="text-sm text-rose-700">
        {businesses.error || users.error || bookings.error || enquiries.error || subscriptions.error}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin overview"
        description="Monitor business growth, moderation volume and subscription readiness."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total businesses" value={businesses.items.length} />
        <StatCard label="Active businesses" value={activeBusinesses} />
        <StatCard label="Pending verification" value={pendingVerifications} />
        <StatCard label="Bookings" value={bookings.items.length} />
        <StatCard label="Enquiries" value={enquiries.items.length} />
        <StatCard label="Subscriptions" value={subscriptions.items.length} />
      </div>

      {recentSignups.length === 0 ? (
        <EmptyState description="New signups will appear here as the platform goes live." title="No recent signups" />
      ) : (
        <Card className="space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-brand-ink">Recent signups</h2>
          <div className="grid gap-3">
            {recentSignups.map((user) => (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand-line px-4 py-3 text-sm" key={user.id}>
                <div>
                  <p className="font-medium text-brand-ink">{user.fullName}</p>
                  <p className="text-slate-500">{user.email}</p>
                </div>
                <span className="rounded-full bg-brand-sand px-3 py-1 text-xs font-semibold text-brand-forest">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
