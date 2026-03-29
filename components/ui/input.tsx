import * as React from "react";

import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-2xl border border-brand-line bg-white px-4 text-sm text-brand-ink outline-none transition placeholder:text-slate-400 focus:border-brand-emerald",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";
