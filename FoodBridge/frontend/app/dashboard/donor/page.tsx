import { DonorDashboardView } from "@/components/donor-dashboard-view";

import { requireDonorSession } from "./require-donor-session";

export default function DonorDashboardPage() {
  const session = requireDonorSession();

  return <DonorDashboardView session={session} />;
}
