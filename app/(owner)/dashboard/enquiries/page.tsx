"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Business, Enquiry } from "@/types";

export default function OwnerEnquiriesPage() {
  const { user } = useAuth();
  const businesses = useManagedCollection<Business>("businesses");
  const enquiries = useManagedCollection<Enquiry>("enquiries");

  const businessIds = useMemo(
    () => businesses.items.filter((business) => business.ownerId === user?.id).map((business) => business.id),
    [businesses.items, user?.id]
  );

  const myEnquiries = useMemo(
    () => enquiries.items.filter((item) => businessIds.includes(item.businessId)),
    [businessIds, enquiries.items]
  );

  async function updateStatus(enquiry: Enquiry, status: Enquiry["status"]) {
    await enquiries.save({
      ...enquiry,
      status,
      updatedAt: new Date().toISOString()
    });
  }

  if (businesses.loading || enquiries.loading) {
    return <Card>Loading your enquiries...</Card>;
  }

  if (enquiries.error) {
    return <Card className="text-sm text-rose-700">{enquiries.error}</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Enquiries" description="Manage incoming lead messages and update follow-up status." />

      {myEnquiries.length === 0 ? (
        <EmptyState description="No enquiries have come in yet." title="No enquiries yet" />
      ) : (
        <div className="grid gap-4">
          {myEnquiries.map((enquiry) => (
            <Card className="space-y-4" key={enquiry.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-brand-ink">{enquiry.subject}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {enquiry.name} | {enquiry.email || enquiry.phone}
                  </p>
                </div>
                <Badge>{enquiry.status}</Badge>
              </div>
              <p className="text-sm text-slate-600">{enquiry.message}</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void updateStatus(enquiry, "read")} variant="outline">
                  Mark read
                </Button>
                <Button onClick={() => void updateStatus(enquiry, "responded")} variant="outline">
                  Mark responded
                </Button>
                <Button onClick={() => void updateStatus(enquiry, "closed")} variant="outline">
                  Close
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
