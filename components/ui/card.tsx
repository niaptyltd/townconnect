import { cn } from "@/utils/cn";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("glass-card p-5 sm:p-6", className)}>{children}</div>;
}
