import { NgoDashboardRouteView } from "@/components/ngo-dashboard-client";

import { requireNgoSession } from "../require-ngo-session";

export default function NgoImpactPage() {
  const session = requireNgoSession();

  return <NgoDashboardRouteView page="impact" session={session} />;
}
