import * as React from "react";

import { cn } from "@/utils/cn";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full rounded-2xl border border-brand-line bg-white px-4 text-sm text-brand-ink outline-none transition focus:border-brand-emerald",
      className
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = "Select";
