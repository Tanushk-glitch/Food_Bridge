import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { AdminDonationsPanel } from "@/components/admin/admin-donations-panel";
import { AdminStatsCards } from "@/components/admin/admin-stats-cards";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { getSession } from "@/lib/auth";

export default function AdminDashboardPage() {
  const session = getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.dbRole !== "ADMIN") {
    redirect("/");
  }

  return (
      <DashboardShell
      currentPath="/dashboard/admin"
      role="admin"
      session={session}
      title="Admin Dashboard"
      subtitle="Manage users, verify NGOs, monitor active donations, and watch platform analytics from one restricted console."
    >
      <AdminStatsCards />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminUsersTable />
        <AdminDonationsPanel />
      </div>
    </DashboardShell>
  );
}
