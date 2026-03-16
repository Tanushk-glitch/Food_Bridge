import { DonorDashboardRouteView } from "@/components/donor-dashboard-view";

import { requireDonorSession } from "../require-donor-session";

export default function DonorDonationHistoryPage() {
  const session = requireDonorSession();

  return <DonorDashboardRouteView page="donation-history" session={session} />;
}
