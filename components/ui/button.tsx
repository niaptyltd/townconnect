import * as React from "react";

import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-forest text-white shadow-soft hover:bg-brand-ink focus-visible:outline-brand-emerald",
  secondary:
    "bg-brand-gold text-brand-ink hover:bg-[#c98b14] focus-visible:outline-brand-gold",
  ghost: "bg-transparent text-brand-ink hover:bg-brand-sand focus-visible:outline-brand-emerald",
  outline:
    "border border-brand-line bg-white text-brand-ink hover:border-brand-emerald hover:text-brand-forest focus-visible:outline-brand-emerald",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", fullWidth, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          buttonVariants[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
