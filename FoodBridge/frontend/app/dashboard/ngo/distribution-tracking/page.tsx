import { NgoDashboardRouteView } from "@/components/ngo-dashboard-client";

import { requireNgoSession } from "../require-ngo-session";

export default function NgoDistributionTrackingPage() {
  const session = requireNgoSession();

  return <NgoDashboardRouteView page="distribution-tracking" session={session} />;
}
