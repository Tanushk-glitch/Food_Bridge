import { redirect } from "next/navigation";

import { getDashboardPath, getSession } from "@/lib/auth";

export default function DashboardIndexPage() {
  const session = getSession();

  if (!session) {
    redirect("/login");
  }

  redirect(session.onboardingCompleted ? getDashboardPath(session.role) : "/onboarding");
}
