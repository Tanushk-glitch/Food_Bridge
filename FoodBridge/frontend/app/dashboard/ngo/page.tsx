import { redirect } from "next/navigation";

import { NgoDashboardClient } from "@/components/ngo-dashboard-client";
import { getSession } from "@/lib/auth";

export default function NgoDashboardPage() {
  const session = getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ngo") {
    redirect(session.onboardingCompleted ? "/dashboard" : "/onboarding");
  }

  if (!session.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <NgoDashboardClient session={session} />;
}
