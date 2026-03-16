import { DonorDashboardRouteView } from "@/components/donor-dashboard-view";

import { requireDonorSession } from "../require-donor-session";

export default function DonorSettingsPage() {
  const session = requireDonorSession();

  return <DonorDashboardRouteView page="settings" session={session} />;
}
