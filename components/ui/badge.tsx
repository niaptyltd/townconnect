import { cn } from "@/utils/cn";

export function Badge({
  children,
  variant = "neutral"
}: {
  children: React.ReactNode;
  variant?: "neutral" | "success" | "warning" | "danger";
}) {
  const styles = {
    neutral: "bg-brand-sand text-brand-forest",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800"
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", styles[variant])}>
      {children}
    </span>
  );
}
