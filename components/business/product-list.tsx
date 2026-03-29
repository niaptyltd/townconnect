import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/format";

export function ProductList({ items }: { items: Product[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((product) => (
        <Card className="space-y-3 overflow-hidden p-0" key={product.id}>
          <div
            className="h-40 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(15,31,28,0.02), rgba(15,31,28,0.25)), url(${product.imageUrl})`
            }}
          />
          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading text-xl font-semibold text-brand-ink">{product.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{product.description}</p>
              </div>
              <Badge>{product.stockStatus.replace("_", " ")}</Badge>
            </div>
            <p className="text-lg font-semibold text-brand-forest">{formatCurrency(product.price)}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
