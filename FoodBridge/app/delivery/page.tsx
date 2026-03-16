import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export default function LegacyDeliveryPage() {
  const session = getSession();
  redirect(session?.role === "delivery" && session.onboardingCompleted ? "/dashboard/delivery" : "/signup?role=delivery");
}
