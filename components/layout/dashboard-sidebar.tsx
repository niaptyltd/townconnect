"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { accountNavigation, adminNavigation, ownerNavigation } from "@/constants/navigation";
import { cn } from "@/utils/cn";

export function DashboardSidebar({
  variant
}: {
  variant: "account" | "owner" | "admin";
}) {
  const pathname = usePathname();
  const items =
    variant === "admin" ? adminNavigation : variant === "owner" ? ownerNavigation : accountNavigation;

  return (
    <aside className="glass-card h-fit p-3">
      <nav className="grid gap-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              className={cn(
                "rounded-2xl px-4 py-3 text-sm font-medium transition",
                active ? "bg-brand-forest text-white" : "text-slate-700 hover:bg-brand-sand"
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
