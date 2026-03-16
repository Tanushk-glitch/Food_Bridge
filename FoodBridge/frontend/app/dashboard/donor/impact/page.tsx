import { DonorDashboardRouteView } from "@/components/donor-dashboard-view";

import { requireDonorSession } from "../require-donor-session";

export default function DonorImpactPage() {
  const session = requireDonorSession();

  return <DonorDashboardRouteView page="impact" session={session} />;
}
