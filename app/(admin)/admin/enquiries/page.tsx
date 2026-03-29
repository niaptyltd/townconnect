"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useManagedCollection } from "@/hooks/use-managed-collection";
import type { Enquiry } from "@/types";

export default function AdminEnquiriesPage() {
  const enquiries = useManagedCollection<Enquiry>("enquiries");

  if (enquiries.loading) {
    return <Card>Loading enquiries...</Card>;
  }

  if (enquiries.error) {
    return <Card className="text-sm text-rose-700">{enquiries.error}</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Enquiries" description="View all platform lead messages in one place." />
      {enquiries.items.length === 0 ? (
        <EmptyState description="Enquiries will appear here as customers start contacting businesses." title="No enquiries yet" />
      ) : (
        <div className="grid gap-4">
          {enquiries.items.map((enquiry) => (
            <Card className="space-y-3" key={enquiry.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-brand-ink">{enquiry.subject}</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {enquiry.name} | {enquiry.email || enquiry.phone}
                  </p>
                </div>
                <Badge>{enquiry.status}</Badge>
              </div>
              <p className="text-sm text-slate-600">{enquiry.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
