"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/login?reason=session_expired&next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace("/forbidden");
    }
  }, [allowedRoles, loading, pathname, router, user]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-line border-t-brand-emerald" />
        <div className="space-y-2">
          <p className="font-medium text-brand-ink">Checking your access...</p>
          <p className="text-sm text-slate-600">
            If nothing happens, head back to{" "}
            <Link className="text-brand-emerald underline" href="/login">
              login
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
