import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export default function LegacyNgoPage() {
  const session = getSession();
  redirect(session?.role === "ngo" && session.onboardingCompleted ? "/dashboard/ngo" : "/signup?role=ngo");
}
