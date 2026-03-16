import { DonorDashboardRouteView } from "@/components/donor-dashboard-view";

import { requireDonorSession } from "../require-donor-session";

export default function DonorPostDonationPage() {
  const session = requireDonorSession();

  return <DonorDashboardRouteView page="post-donation" session={session} />;
}
