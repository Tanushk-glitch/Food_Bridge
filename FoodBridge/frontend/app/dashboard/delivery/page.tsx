import { redirect } from "next/navigation";

import { DeliveryDashboardClient } from "@/components/delivery-dashboard-client";
import { getSession } from "@/lib/auth";

export default function DeliveryDashboardPage() {
  const session = getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "delivery") {
    redirect(session.onboardingCompleted ? "/dashboard" : "/onboarding");
  }

  if (!session.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <DeliveryDashboardClient session={session} />;
}
