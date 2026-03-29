"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { publicNavigation } from "@/constants/navigation";
import { APP_NAME } from "@/constants/platform";
import { useAuth } from "@/hooks/use-auth";

function getRoleLink(role?: string) {
  if (role === "admin") return "/admin";
  if (role === "business_owner") return "/dashboard";
  if (role === "customer") return "/account";
  return "/login";
}

export function SiteHeader() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navigation = useMemo(() => publicNavigation, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/85 backdrop-blur">
      <div className="container-shell flex min-h-16 items-center justify-between gap-4 py-3">
        <Link className="flex items-center gap-3" href="/">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-forest font-heading text-sm font-semibold text-white">
            TC
          </span>
          <div>
            <p className="font-heading text-lg font-semibold text-brand-ink">{APP_NAME}</p>
            <p className="text-xs text-slate-500">Grow local, town by town</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navigation.map((item) => (
            <Link className="text-sm font-medium text-slate-700 transition hover:text-brand-forest" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link className="text-sm font-medium text-slate-600" href={getRoleLink(user.role)}>
                {user.fullName}
              </Link>
              <Button onClick={() => logout()} variant="outline">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link className="text-sm font-medium text-slate-600" href="/login">
                Login
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-ink"
                href="/list-your-business"
              >
                List Your Business
              </Link>
            </>
          )}
        </div>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-line bg-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-brand-line bg-white lg:hidden">
          <div className="container-shell flex flex-col gap-3 py-4">
            {navigation.map((item) => (
              <Link
                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-sand"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-sand"
              href={user ? getRoleLink(user.role) : "/login"}
              onClick={() => setOpen(false)}
            >
              {user ? "Dashboard" : "Login"}
            </Link>
            <Link
              className="rounded-2xl bg-brand-forest px-4 py-3 text-center text-sm font-semibold text-white"
              href="/list-your-business"
              onClick={() => setOpen(false)}
            >
              List Your Business
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
