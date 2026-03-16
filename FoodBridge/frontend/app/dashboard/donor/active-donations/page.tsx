import { DonorDashboardRouteView } from "@/components/donor-dashboard-view";

import { requireDonorSession } from "../require-donor-session";

export default function DonorActiveDonationsPage() {
  const session = requireDonorSession();

  return <DonorDashboardRouteView page="active-donations" session={session} />;
}
