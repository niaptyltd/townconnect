import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <ArrowUpRight className="h-4 w-4 text-brand-emerald" />
      </div>
      <p className="font-heading text-3xl font-semibold text-brand-ink">{value}</p>
      {detail ? <p className="text-sm text-slate-500">{detail}</p> : null}
    </Card>
  );
}
