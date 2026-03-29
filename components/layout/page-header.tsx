export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-brand-ink">{title}</h1>
        {description ? <p className="max-w-2xl text-sm text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
