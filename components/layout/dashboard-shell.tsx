import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export function DashboardShell({
  children,
  variant
}: {
  children: React.ReactNode;
  variant: "account" | "owner" | "admin";
}) {
  return (
    <div className="container-shell section-space">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <DashboardSidebar variant={variant} />
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
