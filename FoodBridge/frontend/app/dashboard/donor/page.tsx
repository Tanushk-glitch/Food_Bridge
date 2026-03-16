import { redirect } from "next/navigation";

import { DonorDashboardView } from "@/components/donor-dashboard-view";
import { getSession } from "@/lib/auth";

export default function DonorDashboardPage() {
  const session = getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "donor") {
    redirect(session.onboardingCompleted ? "/dashboard" : "/onboarding");
  }

  if (!session.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <DonorDashboardView session={session} />;
}
