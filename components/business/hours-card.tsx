import { Card } from "@/components/ui/card";
import type { OperatingHours } from "@/types";
import { formatTimeWindow } from "@/utils/format";

const labels = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"]
] as const;

export function HoursCard({ hours }: { hours: OperatingHours }) {
  return (
    <Card>
      <h3 className="font-heading text-2xl font-semibold text-brand-ink">Operating hours</h3>
      <div className="mt-5 grid gap-3">
        {labels.map(([key, label]) => (
          <div className="flex items-center justify-between gap-4 border-b border-brand-line/70 pb-3 text-sm" key={key}>
            <span className="font-medium text-brand-ink">{label}</span>
            <span className="text-slate-600">{formatTimeWindow(hours[key])}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
