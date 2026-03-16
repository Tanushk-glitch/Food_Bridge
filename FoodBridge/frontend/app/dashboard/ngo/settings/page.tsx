import { NgoDashboardRouteView } from "@/components/ngo-dashboard-client";

import { requireNgoSession } from "../require-ngo-session";

export default function NgoSettingsPage() {
  const session = requireNgoSession();

  return <NgoDashboardRouteView page="settings" session={session} />;
}
