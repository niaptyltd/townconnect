import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { getServerSession } from "@/lib/auth/session-cookie";
import { ProtectedRoute } from "@/lib/auth/route-guard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect(session.role === "business_owner" ? "/dashboard" : "/account");
  }

  return (
    <>
      <SiteHeader />
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardShell variant="admin">{children}</DashboardShell>
      </ProtectedRoute>
    </>
  );
}
