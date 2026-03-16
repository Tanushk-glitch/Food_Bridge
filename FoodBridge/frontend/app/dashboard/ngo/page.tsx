import { NgoDashboardClient } from "@/components/ngo-dashboard-client";

import { requireNgoSession } from "./require-ngo-session";

export default function NgoDashboardPage() {
  const session = requireNgoSession();

  return <NgoDashboardClient session={session} />;
}
