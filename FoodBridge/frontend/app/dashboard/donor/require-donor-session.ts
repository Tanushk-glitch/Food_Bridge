import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export function requireDonorSession() {
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

  return session;
}
