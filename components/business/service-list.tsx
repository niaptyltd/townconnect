import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Service } from "@/types";
import { formatCurrency } from "@/utils/format";

export function ServiceList({ items }: { items: Service[] }) {
  return (
    <div className="grid gap-4">
      {items.map((service) => (
        <Card className="space-y-3" key={service.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading text-xl font-semibold text-brand-ink">{service.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{service.description}</p>
            </div>
            <Badge variant="success">{service.durationMinutes} min</Badge>
          </div>
          <p className="text-lg font-semibold text-brand-forest">{formatCurrency(service.price)}</p>
        </Card>
      ))}
    </div>
  );
}
