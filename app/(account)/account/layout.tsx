import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { getServerSession } from "@/lib/auth/session-cookie";
import { ProtectedRoute } from "@/lib/auth/route-guard";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "customer") {
    redirect(session.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <>
      <SiteHeader />
      <ProtectedRoute allowedRoles={["customer"]}>
        <DashboardShell variant="account">{children}</DashboardShell>
      </ProtectedRoute>
    </>
  );
}
