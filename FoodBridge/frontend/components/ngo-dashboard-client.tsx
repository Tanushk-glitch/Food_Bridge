"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  MapPin,
  Package,
  Route,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { LiveDonationMap } from "@/components/live-donation-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DemoSession } from "@/lib/session-types";
import { cn } from "@/lib/utils";

type NgoPageKey = "overview" | "browse-donations" | "distribution-tracking" | "impact" | "settings";
type NgoDonationStatus = "POSTED" | "NGO_ACCEPTED" | "PICKED_UP" | "DELIVERED";

type DbDonation = {
  id: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  location: string;
  status: string;
  donorId: string;
  ngoId: string | null;
  createdAt: string;
  donor?: { name: string; email: string } | null;
  ngo?: { name: string; email: string } | null;
};

const ngoNavItems = [
  { href: "/dashboard/ngo", label: "Dashboard", icon: BarChart3, match: ["/dashboard/ngo"] },
  { href: "/dashboard/ngo/browse-donations", label: "Browse Donations", icon: HeartHandshake },
  { href: "/dashboard/ngo/distribution-tracking", label: "Distribution Tracking", icon: Route },
  { href: "/dashboard/ngo/impact", label: "Impact", icon: BarChart3 },
  { href: "/dashboard/ngo/settings", label: "Settings", icon: Settings },
];

const pickupStages: NgoDonationStatus[] = ["POSTED", "NGO_ACCEPTED", "PICKED_UP", "DELIVERED"];

const pageMeta: Record<NgoPageKey, { currentPath: string; title: string; subtitle: string }> = {
  overview: {
    currentPath: "/dashboard/ngo",
    title: "NGO Dashboard",
    subtitle: "Monitor open donations, map nearby pickups, and keep your response team aligned in real time.",
  },
  "browse-donations": {
    currentPath: "/dashboard/ngo/browse-donations",
    title: "Browse Donations",
    subtitle: "Review available food listings, compare pickup details, and accept the donations your team can fulfill quickly.",
  },
  "distribution-tracking": {
    currentPath: "/dashboard/ngo/distribution-tracking",
    title: "Distribution Tracking",
    subtitle: "Track accepted donations through pickup, handoff, and final delivery across your active routes.",
  },
  impact: {
    currentPath: "/dashboard/ngo/impact",
    title: "Impact",
    subtitle: "Measure meals distributed, volunteer readiness, and community reach across your organization's operations.",
  },
  settings: {
    currentPath: "/dashboard/ngo/settings",
    title: "Settings",
    subtitle: "Manage organization details, service regions, volunteer operations, and notification defaults.",
  },
};

function getDistanceLabel(id: string) {
  const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const distance = ((hash % 30) + 8) / 10;
  return `${distance.toFixed(1)} km`;
}

function getStatusVariant(status: string) {
  if (status === "DELIVERED") return "success" as const;
  if (status === "PICKED_UP") return "warning" as const;
  if (status === "NGO_ACCEPTED") return "info" as const;
  return "default" as const;
}

function getPickupProgress(status: string) {
  const index = pickupStages.indexOf(status as NgoDonationStatus);
  if (index === -1) return 25;
  return ((index + 1) / pickupStages.length) * 100;
}

function normalizeStatus(status: string): NgoDonationStatus {
  if (status === "NGO_ACCEPTED" || status === "PICKED_UP" || status === "DELIVERED") {
    return status;
  }
  return "POSTED";
}

function formatPickupTime(value: string, createdAt?: string) {
  const date = createdAt ? new Date(createdAt) : null;
  if (date && !Number.isNaN(date.getTime())) {
    const pickup = new Date(date.getTime() + 60 * 60 * 1000);
    return pickup.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return value;
}

function useNgoDashboardData(session: DemoSession) {
  const [donations, setDonations] = useState<DbDonation[]>([]);
  const [pickupRequests, setPickupRequests] = useState<DbDonation[]>([]);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [acceptedToday, setAcceptedToday] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const ngoId = session.email;

  const fetchOpenDonations = useCallback(async () => {
    try {
      const res = await fetch("/api/donations/open");
      const data = await res.json();
      if (data.donations) {
        setDonations(data.donations);
      }
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    }
  }, []);

  const fetchPickupRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/donations/pickups");
      const data = await res.json();
      if (data.donations) {
        setPickupRequests(data.donations);
      }
    } catch (err) {
      console.error("Failed to fetch pickup requests:", err);
    }
  }, []);

  useEffect(() => {
    fetchOpenDonations();
    fetchPickupRequests();
    const interval = setInterval(() => {
      fetchOpenDonations();
      fetchPickupRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOpenDonations, fetchPickupRequests]);

  async function handleAccept(donationId: string) {
    setAccepting(donationId);

    try {
      const res = await fetch("/api/donations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId, ngoId }),
      });

      if (res.ok) {
        setAcceptedToday((prev) => prev + 1);
        await Promise.all([fetchOpenDonations(), fetchPickupRequests()]);
      }
    } catch (err) {
      console.error("Failed to accept donation:", err);
    } finally {
      setAccepting(null);
    }
  }

  async function handleStatusUpdate(donationId: string, nextStatus: "PICKED_UP" | "DELIVERED") {
    setUpdatingStatus(donationId);

    try {
      const endpoint = nextStatus === "PICKED_UP" ? "/api/donations/pickup" : "/api/donations/deliver";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
      });

      if (res.ok) {
        setPickupRequests((prev) =>
          prev.map((donation) =>
            donation.id === donationId ? { ...donation, status: nextStatus } : donation
          )
        );
      }
    } catch (err) {
      console.error("Failed to update donation status:", err);
    } finally {
      setUpdatingStatus(null);
    }
  }

  const stats = [
    { label: "Open Donations", value: String(donations.length), detail: "Available for pickup" },
    { label: "Accepted Today", value: String(acceptedToday), detail: "By your organization" },
    { label: "Auto Refresh", value: "5s", detail: "Dashboard updates live" },
  ];

  const impactStats = useMemo(() => {
    const totalMealsDistributed = pickupRequests.reduce((sum, donation) => {
      const parsed = Number((donation.quantity.match(/\d+/) || ["0"])[0]);
      return sum + parsed;
    }, 0);

    return [
      { label: "Total Meals Distributed", value: String(Math.max(totalMealsDistributed, 780)), detail: "Accepted and delivered through your NGO" },
      { label: "Volunteers Active", value: "8", detail: "Teams available for collection and handoff" },
      { label: "Community Reach", value: "3 zones", detail: "Service clusters active today" },
    ];
  }, [pickupRequests]);

  return {
    accepting,
    donations,
    fetchOpenDonations,
    handleAccept,
    handleStatusUpdate,
    impactStats,
    ngoId,
    pickupRequests,
    stats,
    updatingStatus,
  };
}

function OverviewSection({
  donations,
  handleAccept,
  ngoId,
  stats,
}: {
  donations: DbDonation[];
  handleAccept: (donationId: string) => Promise<void>;
  ngoId: string;
  stats: Array<{ label: string; value: string; detail: string }>;
}) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Donation Map</CardTitle>
          <CardDescription>Visualize your NGO location, nearby donation markers, and service coverage radius.</CardDescription>
        </CardHeader>
        <CardContent>
          <LiveDonationMap donations={donations} mode="NGO" userEmail={ngoId} onAcceptPickup={handleAccept} />
        </CardContent>
      </Card>
    </>
  );
}

function BrowseDonationsSection({
  accepting,
  donations,
  fetchOpenDonations,
  handleAccept,
}: {
  accepting: string | null;
  donations: DbDonation[];
  fetchOpenDonations: () => Promise<void>;
  handleAccept: (donationId: string) => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Available Donations</CardTitle>
            <CardDescription>Food posted by donors, with pickup windows, quantities, and distances. Refreshes every 5 seconds.</CardDescription>
          </div>
          <Button variant="glass" size="sm" onClick={fetchOpenDonations}>
            Refresh now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {donations.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="group rounded-3xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:border-primary/30 hover:shadow-primary-hover"
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-extrabold">{donation.donor?.name || donation.donorId}</h3>
                      <p className="mt-2 text-sm font-medium text-muted-foreground">{donation.foodType}</p>
                    </div>
                    <Badge variant="default">Posted</Badge>
                  </div>
                  <div className="grid gap-3 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      {donation.quantity}
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-warning" />
                      Pickup window: {donation.expiryTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {donation.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-primary" />
                      Distance: {getDistanceLabel(donation.id)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="glass" size="sm">
                      Review
                    </Button>
                    <Button size="sm" disabled={accepting === donation.id} onClick={() => handleAccept(donation.id)}>
                      {accepting === donation.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        "Accept Donation"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-semibold text-muted-foreground">No open donations</p>
            <p className="text-sm text-muted-foreground">When donors post surplus food, it will appear here automatically.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DistributionTrackingSection({
  handleStatusUpdate,
  pickupRequests,
  updatingStatus,
}: {
  handleStatusUpdate: (donationId: string, nextStatus: "PICKED_UP" | "DELIVERED") => Promise<void>;
  pickupRequests: DbDonation[];
  updatingStatus: string | null;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Active pickups</CardTitle>
          <CardDescription>Track accepted donations and move them from pickup to final delivery.</CardDescription>
        </CardHeader>
        <CardContent>
          {pickupRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Food type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Pickup time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickupRequests.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-medium">{donation.donor?.name || donation.donorId}</TableCell>
                    <TableCell>{donation.foodType}</TableCell>
                    <TableCell>{donation.quantity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatPickupTime(donation.expiryTime, donation.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(donation.status)}>{normalizeStatus(donation.status).replaceAll("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {normalizeStatus(donation.status) === "NGO_ACCEPTED" && (
                          <Button
                            size="sm"
                            disabled={updatingStatus === donation.id}
                            onClick={() => handleStatusUpdate(donation.id, "PICKED_UP")}
                          >
                            {updatingStatus === donation.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Mark Picked Up"
                            )}
                          </Button>
                        )}
                        {normalizeStatus(donation.status) === "PICKED_UP" && (
                          <Button
                            size="sm"
                            disabled={updatingStatus === donation.id}
                            onClick={() => handleStatusUpdate(donation.id, "DELIVERED")}
                          >
                            {updatingStatus === donation.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Mark Delivered"
                            )}
                          </Button>
                        )}
                        {normalizeStatus(donation.status) === "DELIVERED" && (
                          <Button size="sm" disabled className="bg-green-600 text-white">
                            <CheckCircle2 className="h-4 w-4" />
                            Delivered
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Route className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-semibold text-muted-foreground">No active pickups</p>
              <p className="text-sm text-muted-foreground">Accepted donations will appear here for tracking.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {pickupRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery pipeline</CardTitle>
            <CardDescription>Follow each active donation through the operational handoff stages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pickupRequests.map((donation) => (
              <div key={donation.id} className="rounded-3xl border border-border bg-muted/30 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium">{donation.donor?.name || donation.donorId}</p>
                    <p className="text-sm text-muted-foreground">
                      {donation.foodType} - {donation.quantity} - {donation.location}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(donation.status)}>{normalizeStatus(donation.status).replaceAll("_", " ")}</Badge>
                </div>
                <div className="mt-4">
                  <Progress value={getPickupProgress(normalizeStatus(donation.status))} />
                </div>
                <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                  {pickupStages.map((stage) => {
                    const currentIndex = pickupStages.indexOf(normalizeStatus(donation.status));
                    const stageIndex = pickupStages.indexOf(stage);
                    const isReached = stageIndex <= currentIndex;

                    return (
                      <div
                        key={stage}
                        className={cn(
                          "rounded-full border px-3 py-2 text-center",
                          isReached
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-white/10 bg-white/5 text-muted-foreground"
                        )}
                      >
                        {stage.replaceAll("_", " ")}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

function ImpactSection({ impactStats }: { impactStats: Array<{ label: string; value: string; detail: string }> }) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {impactStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Service coverage</CardTitle>
            <CardDescription>Where your team is currently active.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Koramangala East cluster</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Ejipura community kitchens</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> HSR volunteer route</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Volunteer readiness</CardTitle>
            <CardDescription>Current staffing for collection and handoff.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-warning" /> 8 volunteers available this evening</div>
            <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-warning" /> 2 cold-storage handling teams</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sky-500" /> Verification checks up to date</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>People served</CardTitle>
            <CardDescription>Distribution targets for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-3xl bg-gradient-to-br from-primary/15 to-accent/10 p-5">
              <p className="text-sm text-muted-foreground">Projected by midnight</p>
              <p className="mt-2 font-display text-4xl font-extrabold">780 people</p>
              <p className="mt-2 text-sm text-muted-foreground">Driven by accepted pickups already in motion.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function SettingsSection({ session }: { session: DemoSession }) {
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization profile</CardTitle>
            <CardDescription>Core NGO details used across donation matching and pickup coordination.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><HeartHandshake className="h-4 w-4 text-primary" /> {session.organizationName ?? session.name}</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Primary coordinator: {session.name}</div>
            <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Contact email: {session.email}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service regions</CardTitle>
            <CardDescription>Saved coverage zones for matching donors and planning pickups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Koramangala East cluster</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Ejipura community kitchens</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> HSR Layout outreach corridor</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Volunteer settings</CardTitle>
            <CardDescription>Operational defaults for availability, handling, and pickup readiness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-warning" /> Evening shift roster enabled for 8 volunteers</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sky-500" /> Cold-storage handling team verification active</div>
            <div className="flex items-center gap-2"><Route className="h-4 w-4 text-primary" /> Auto-assign closest pickup route for urgent donations</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
            <CardDescription>Alerts for newly posted food, accepted pickups, and delivery milestones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-warning" /> Instant alerts for nearby newly posted donations</div>
            <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-warning" /> Status notifications for pickup and delivery changes</div>
            <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-warning" /> End-of-day summary for meals served and volunteer readiness</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function NgoDashboardRouteView({
  page,
  session,
}: {
  page: NgoPageKey;
  session: DemoSession;
}) {
  const data = useNgoDashboardData(session);
  const meta = pageMeta[page];

  return (
    <DashboardShell
      currentPath={meta.currentPath}
      role="ngo"
      session={session}
      navItems={ngoNavItems}
      title={meta.title}
      subtitle={meta.subtitle}
    >
      {page === "overview" && (
        <OverviewSection donations={data.donations} handleAccept={data.handleAccept} ngoId={data.ngoId} stats={data.stats} />
      )}
      {page === "browse-donations" && (
        <BrowseDonationsSection
          accepting={data.accepting}
          donations={data.donations}
          fetchOpenDonations={data.fetchOpenDonations}
          handleAccept={data.handleAccept}
        />
      )}
      {page === "distribution-tracking" && (
        <DistributionTrackingSection
          handleStatusUpdate={data.handleStatusUpdate}
          pickupRequests={data.pickupRequests}
          updatingStatus={data.updatingStatus}
        />
      )}
      {page === "impact" && <ImpactSection impactStats={data.impactStats} />}
      {page === "settings" && <SettingsSection session={session} />}
    </DashboardShell>
  );
}

export function NgoDashboardClient({ session }: { session: DemoSession }) {
  return <NgoDashboardRouteView page="overview" session={session} />;
}
