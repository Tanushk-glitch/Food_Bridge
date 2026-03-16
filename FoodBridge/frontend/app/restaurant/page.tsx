import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export default function LegacyRestaurantPage() {
  const session = getSession();
  redirect(session?.role === "donor" && session.onboardingCompleted ? "/dashboard/donor" : "/signup?role=donor");
}
