import { NgoDashboardRouteView } from "@/components/ngo-dashboard-client";

import { requireNgoSession } from "../require-ngo-session";

export default function NgoBrowseDonationsPage() {
  const session = requireNgoSession();

  return <NgoDashboardRouteView page="browse-donations" session={session} />;
}
