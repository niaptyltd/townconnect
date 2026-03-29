"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { useAdminCollection } from "@/hooks/use-admin-collection";
import { listActivityLogs } from "@/services/admin-service";
import type { ActivityLog } from "@/types";

export default function AdminActivityPage() {
  const activity = useAdminCollection<ActivityLog>(listActivityLogs);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity log"
        description="Recent admin and owner actions captured by the platform."
      />

      {activity.loading ? <Card>Loading activity log...</Card> : null}
      {activity.error ? <Card className="text-sm text-rose-600">{activity.error}</Card> : null}

      {!activity.loading && !activity.error ? (
        <div className="grid gap-4">
          {activity.items.length ? (
            activity.items.map((item) => (
              <Card className="space-y-2" key={item.id}>
                <h2 className="font-heading text-xl font-semibold text-brand-ink">
                  {item.action}
                </h2>
                <p className="text-sm text-slate-600">
                  Actor: {item.actorRole} • Entity: {item.entityType} • Created: {item.createdAt}
                </p>
              </Card>
            ))
          ) : (
            <Card>No activity has been logged yet.</Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
