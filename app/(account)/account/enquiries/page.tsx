"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Business, Enquiry } from "@/types";
import { formatDate } from "@/utils/format";

export default function AccountEnquiriesPage() {
  const { user } = useAuth();
  const enquiries = useManagedCollection<Enquiry>("enquiries");
  const businesses = useManagedCollection<Business>("businesses");

  const myEnquiries = useMemo(
    () =>
      enquiries.items.filter((item) => item.customerId === user?.id || item.email === user?.email),
    [enquiries.items, user?.email, user?.id]
  );

  if (enquiries.loading || businesses.loading) {
    return <Card>Loading your enquiries...</Card>;
  }

  if (enquiries.error) {
    return <Card className="text-sm text-rose-700">{enquiries.error}</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your enquiries"
        description="See all the messages you've sent through TownConnect business profiles."
      />

      {myEnquiries.length === 0 ? (
        <EmptyState
          description="You haven't sent any enquiries yet. Use business pages to message local businesses."
          title="No enquiries yet"
        />
      ) : (
        <div className="grid gap-4">
          {myEnquiries.map((enquiry) => (
            <Card className="space-y-3" key={enquiry.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-brand-ink">{enquiry.subject}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {businesses.items.find((business) => business.id === enquiry.businessId)?.businessName ??
                      "Business"}{" "}
                    | {formatDate(enquiry.createdAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    enquiry.status === "responded"
                      ? "success"
                      : enquiry.status === "new"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {enquiry.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{enquiry.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
