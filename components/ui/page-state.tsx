import Link from "next/link";

import { Card } from "@/components/ui/card";

export function PageState({
  title,
  description,
  actionHref,
  actionLabel,
  tone = "default"
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  tone?: "default" | "error";
}) {
  return (
    <div className="container-shell flex min-h-[50vh] items-center justify-center py-12">
      <Card className="max-w-xl space-y-4 text-center">
        <h1 className="font-heading text-3xl font-semibold text-brand-ink">{title}</h1>
        <p className={tone === "error" ? "text-sm text-rose-700" : "text-sm text-slate-600"}>
          {description}
        </p>
        {actionHref && actionLabel ? (
          <div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white"
              href={actionHref}
            >
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
