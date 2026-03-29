import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { getServerSession } from "@/lib/auth/session-cookie";
import { ProtectedRoute } from "@/lib/auth/route-guard";

export default async function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "business_owner") {
    redirect(session.role === "admin" ? "/admin" : "/account");
  }

  return (
    <>
      <SiteHeader />
      <ProtectedRoute allowedRoles={["business_owner"]}>
        <DashboardShell variant="owner">{children}</DashboardShell>
      </ProtectedRoute>
    </>
  );
}
