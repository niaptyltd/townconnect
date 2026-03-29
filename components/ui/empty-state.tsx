import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed text-center">
      <h3 className="font-heading text-xl font-semibold text-brand-ink">{title}</h3>
      <p className="mt-3 text-sm text-slate-600">{description}</p>
    </Card>
  );
}
