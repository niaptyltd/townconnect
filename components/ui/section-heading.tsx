export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-emerald">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-4 muted-copy">{description}</p> : null}
    </div>
  );
}
