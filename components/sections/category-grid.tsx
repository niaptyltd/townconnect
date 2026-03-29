import Link from "next/link";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Category } from "@/types";

export function CategoryGridSection({
  categories,
  townSlug
}: {
  categories: Category[];
  townSlug?: string;
}) {
  return (
    <section className="section-space">
      <div className="container-shell space-y-8">
        <SectionHeading
          eyebrow="Browse categories"
          title="Find businesses by the way people actually search"
          description="Whether someone needs a restaurant, plumber, beauty studio or printer, TownConnect makes that journey quick on affordable mobile devices."
        />

        {categories.length === 0 || !townSlug ? (
          <EmptyState
            description="Categories will appear here once TownConnect has live directory data."
            title="No categories available"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <Link href={`/town/${townSlug}/category/${category.slug}`} key={category.id}>
                <Card className="h-full border-brand-line transition hover:-translate-y-1 hover:border-brand-emerald">
                  <h3 className="font-heading text-xl font-semibold text-brand-ink">{category.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
