"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  Clock3,
  Eye,
  History,
  Leaf,
  Loader2,
  MapPin,
  Package,
  PencilLine,
  PlusCircle,
  Settings,
  UserCircle2,
  Users,
  XCircle,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { ImpactChart } from "@/components/ui/impact-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { donationHistory, donorStats } from "@/lib/data";
import type { DemoSession } from "@/lib/session-types";
import { cn } from "@/lib/utils";

const donorNavItems = [
  { href: "/dashboard/donor", label: "Dashboard", icon: BarChart3, match: ["/dashboard/donor"] },
  { href: "/dashboard/donor/post-donation", label: "Post Donation", icon: PlusCircle },
  { href: "/dashboard/donor/active-donations", label: "Active Donations", icon: Package },
  { href: "/dashboard/donor/donation-history", label: "Donation History", icon: History },
  { href: "/dashboard/donor/impact", label: "Impact", icon: Leaf },
  { href: "/dashboard/donor/settings", label: "Settings", icon: Settings },
];

type DonationStatusType = "POSTED" | "NGO_ACCEPTED" | "DELIVERY_ACCEPTED" | "PICKED_UP" | "DELIVERED";
type DonorPageKey = "overview" | "post-donation" | "active-donations" | "donation-history" | "impact" | "settings";

type DbDonation = {
  id: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  location: string;
  status: DonationStatusType;
  donorId: string;
  ngoId: string | null;
  createdAt: string;
  ngo?: { name: string } | null;
};

const donorStages: DonationStatusType[] = ["POSTED", "NGO_ACCEPTED", "DELIVERY_ACCEPTED", "PICKED_UP", "DELIVERED"];

const statusLabels: Record<DonationStatusType, string> = {
  POSTED: "Posted",
  NGO_ACCEPTED: "Accepted",
  DELIVERY_ACCEPTED: "Pickup Scheduled",
  PICKED_UP: "Picked Up",
  DELIVERED: "Delivered",
};

const pageMeta: Record<DonorPageKey, { currentPath: string; title: string; subtitle: string }> = {
  overview: {
    currentPath: "/dashboard/donor",
    title: "Donor Dashboard",
    subtitle: "Track the health of your donation pipeline with a live overview of active listings, pickups, and completed deliveries.",
  },
  "post-donation": {
    currentPath: "/dashboard/donor/post-donation",
    title: "Post Donation",
    subtitle: "Create a new food listing with the details NGOs need to review, accept, and collect surplus food quickly.",
  },
  "active-donations": {
    currentPath: "/dashboard/donor/active-donations",
    title: "Active Donations",
    subtitle: "Monitor every live donation from posting through acceptance, pickup scheduling, handoff, and final delivery.",
  },
  "donation-history": {
    currentPath: "/dashboard/donor/donation-history",
    title: "Donation History",
    subtitle: "Review completed donations, partner handoffs, and the operational history behind your recent food rescues.",
  },
  impact: {
    currentPath: "/dashboard/donor/impact",
    title: "Impact",
    subtitle: "See how your donations translate into meals served, NGO support, and food waste avoided over time.",
  },
  settings: {
    currentPath: "/dashboard/donor/settings",
    title: "Settings",
    subtitle: "Keep your donor account ready with profile details, notification preferences, and saved pickup defaults.",
  },
};

function getStatusVariant(status: DonationStatusType) {
  if (status === "DELIVERED") return "success" as const;
  if (status === "PICKED_UP" || status === "DELIVERY_ACCEPTED" || status === "NGO_ACCEPTED") return "info" as const;
  return "default" as const;
}

function getProgressValue(status: DonationStatusType) {
  const index = donorStages.indexOf(status);
  if (index === -1) return 20;
  return ((index + 1) / donorStages.length) * 100;
}

function extractCount(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getHistoryTimestamps(date: string, index: number) {
  const base = new Date(`${date}T18:30:00+05:30`);
  const pickup = new Date(base.getTime() + index * 25 * 60 * 1000);
  const delivery = new Date(pickup.getTime() + 75 * 60 * 1000);

  return { pickup, delivery };
}

function useDonorDashboardData(session: DemoSession) {
  const [historyFilter, setHistoryFilter] = useState<"7" | "30" | "all">("30");
  const [liveDonations, setLiveDonations] = useState<DbDonation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const donorId = session.email;

  const fetchDonations = useCallback(async () => {
    try {
      const res = await fetch(`/api/donations/my?donorId=${encodeURIComponent(donorId)}`);
      const data = await res.json();
      if (data.donations) {
        setLiveDonations(data.donations);
      }
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    }
  }, [donorId]);

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 5000);
    return () => clearInterval(interval);
  }, [fetchDonations]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    const formData = new FormData(e.currentTarget);
    const foodType = formData.get("foodType") as string;
    const quantity = formData.get("quantity") as string;
    const pickupTime = formData.get("pickupTime") as string;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;

    try {
      const res = await fetch("/api/donations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodType,
          quantity,
          expiryTime: pickupTime,
          location,
          description,
          donorId,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        fetchDonations();
        setTimeout(() => {
          setDialogOpen(false);
          setSubmitSuccess(false);
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to create donation:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredHistory = useMemo(() => {
    if (historyFilter === "all") {
      return donationHistory;
    }

    const days = Number(historyFilter);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return donationHistory.filter((item) => new Date(item.date) >= cutoff);
  }, [historyFilter]);

  const activeDonations = liveDonations.filter((donation) => donation.status !== "DELIVERED");
  const deliveredCount = liveDonations.filter((donation) => donation.status === "DELIVERED").length;
  const pickupScheduled = liveDonations.filter(
    (donation) => donation.status === "NGO_ACCEPTED" || donation.status === "DELIVERY_ACCEPTED"
  ).length;
  const mealsDonated = liveDonations.reduce((sum, donation) => sum + extractCount(donation.quantity), 0);
  const historyMeals = donationHistory.reduce((sum, item) => sum + item.meals, 0);
  const supportedNgoCount = new Set(
    [
      ...donationHistory.map((item) => item.recipient),
      ...liveDonations.map((donation) => donation.ngo?.name).filter(Boolean),
    ].filter(Boolean)
  ).size;
  const peopleServed = liveDonations.length > 0 ? mealsDonated : historyMeals;
  const wasteReducedKg = Math.max(48, Math.round(peopleServed * 0.45));

  const overviewStats =
    liveDonations.length > 0
      ? [
          { label: "Active Donations", value: String(activeDonations.length), detail: "Currently open" },
          { label: "Meals Donated", value: String(mealsDonated), detail: "Across posted listings" },
          { label: "Pickups Scheduled", value: String(pickupScheduled), detail: "Awaiting pickup" },
          { label: "Successful Deliveries", value: String(deliveredCount), detail: "Completed" },
        ]
      : donorStats;

  const impactSummary = [
    {
      label: "Total Meals Donated",
      value: (liveDonations.length > 0 ? mealsDonated : historyMeals).toLocaleString(),
      detail: "Meals moved through your donor account",
    },
    {
      label: "NGOs Supported",
      value: String(Math.max(3, supportedNgoCount)),
      detail: "Partners who received your donations",
    },
    {
      label: "People Served",
      value: peopleServed.toLocaleString(),
      detail: "Estimated community members reached",
    },
    {
      label: "Food Waste Reduced",
      value: `${wasteReducedKg} kg`,
      detail: "Estimated food kept out of landfill",
    },
  ];

  return {
    dialogOpen,
    fetchDonations,
    filteredHistory,
    handleSubmit,
    historyFilter,
    impactSummary,
    isSubmitting,
    liveDonations,
    overviewStats,
    setDialogOpen,
    setHistoryFilter,
    submitSuccess,
  };
}

function PostDonationSection({
  dialogOpen,
  handleSubmit,
  isSubmitting,
  setDialogOpen,
  submitSuccess,
}: {
  dialogOpen: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  setDialogOpen: (open: boolean) => void;
  submitSuccess: boolean;
}) {
  return (
    <Card className="overflow-hidden border-primary/20">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
      <CardContent className="relative mt-0 flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Primary action</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">Post surplus food in under a minute</h2>
          <p className="mt-3 font-medium text-muted-foreground">
            Create a donation listing with food type, quantity, pickup timing, location, and description so NGOs can respond fast.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="min-w-[220px]">
              <PlusCircle className="h-4 w-4" />
              Post Surplus Food
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">New donation</p>
              <h3 className="font-display text-2xl font-extrabold">Create surplus food listing</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Share the essentials so NGOs can review and schedule pickup quickly.
              </p>
            </div>
            {submitSuccess ? (
              <div className="mt-6 flex flex-col items-center gap-4 py-8">
                <CheckCircle2 className="h-16 w-16 animate-in zoom-in duration-300 text-green-500" />
                <p className="text-xl font-bold text-green-500">Donation Posted Successfully!</p>
                <p className="text-sm text-muted-foreground">NGOs can now see your donation.</p>
              </div>
            ) : (
              <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-bold">Food type</label>
                  <Input name="foodType" placeholder="Fresh rice bowls, sandwiches, meal trays" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Quantity</label>
                  <Input name="quantity" placeholder="40 meal boxes" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Pickup time</label>
                  <Input name="pickupTime" placeholder="10:30 PM tonight" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Location</label>
                  <Input name="location" placeholder="Koramangala, Bengaluru" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Description</label>
                  <Textarea
                    name="description"
                    placeholder="Packaging notes, entry instructions, or food handling guidance..."
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4" />
                        Post Surplus Food
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function OverviewSection({ overviewStats }: { overviewStats: Array<{ label: string; value: string; detail: string }> }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {overviewStats.map((stat) => (
        <Card key={stat.label} className="rounded-3xl p-0">
          <CardContent className="mt-0 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            <p className="mt-3 font-display text-3xl font-extrabold">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{stat.detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function ActiveDonationsSection({
  fetchDonations,
  liveDonations,
}: {
  fetchDonations: () => Promise<void>;
  liveDonations: DbDonation[];
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Active donations</CardTitle>
              <CardDescription>
                {liveDonations.length > 0
                  ? "Live data from your posted donations updates every 5 seconds."
                  : "Current listings that still need confirmation, pickup, or delivery completion."}
              </CardDescription>
            </div>
            <Button variant="glass" size="sm" onClick={fetchDonations}>
              Refresh now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {liveDonations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Food item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pickup details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <p className="font-medium">{donation.foodType}</p>
                      <p className="text-sm text-muted-foreground">
                        Posted{" "}
                        {new Date(donation.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </TableCell>
                    <TableCell>{donation.quantity}</TableCell>
                    <TableCell>{donation.location}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(donation.status)}>{statusLabels[donation.status] || donation.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {donation.ngo?.name || "NGO not assigned yet"}
                      <div>{donation.expiryTime}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="glass" size="sm">
                          <PencilLine className="h-4 w-4" />
                          Edit donation
                        </Button>
                        <Button type="button" variant="glass" size="sm">
                          <XCircle className="h-4 w-4" />
                          Cancel listing
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button type="button" size="sm">
                              <Eye className="h-4 w-4" />
                              View pickup details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Pickup details</p>
                                <h3 className="mt-2 font-display text-2xl font-extrabold">{donation.foodType}</h3>
                              </div>
                              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                                  <p className="font-semibold text-foreground">Current status</p>
                                  <p className="mt-2">{statusLabels[donation.status]}</p>
                                </div>
                                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                                  <p className="font-semibold text-foreground">Assigned NGO</p>
                                  <p className="mt-2">{donation.ngo?.name || "Pending assignment"}</p>
                                </div>
                                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                                  <p className="font-semibold text-foreground">Pickup window</p>
                                  <p className="mt-2">{donation.expiryTime}</p>
                                </div>
                                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                                  <p className="font-semibold text-foreground">Location</p>
                                  <p className="mt-2">{donation.location}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-semibold text-muted-foreground">No donations yet</p>
              <p className="text-sm text-muted-foreground">Post your first surplus food donation to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {liveDonations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Donation status tracker</CardTitle>
            <CardDescription>Follow each donation from posting through acceptance, pickup, and delivery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveDonations.map((donation) => (
              <div key={donation.id} className="rounded-3xl border border-border bg-muted/30 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium">{donation.foodType}</p>
                    <p className="text-sm text-muted-foreground">
                      {donation.quantity} - {donation.location}
                      {donation.ngo ? ` - ${donation.ngo.name}` : ""}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(donation.status)}>{statusLabels[donation.status] || donation.status}</Badge>
                </div>
                <div className="mt-4">
                  <Progress value={getProgressValue(donation.status)} />
                </div>
                <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-5">
                  {donorStages.map((stage) => {
                    const isReached = donorStages.indexOf(stage) <= donorStages.indexOf(donation.status);
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
                        {statusLabels[stage]}
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

function DonationHistorySection({
  filteredHistory,
  historyFilter,
  impactSummary,
  setHistoryFilter,
}: {
  filteredHistory: typeof donationHistory;
  historyFilter: "7" | "30" | "all";
  impactSummary: Array<{ label: string; value: string; detail: string }>;
  setHistoryFilter: (value: "7" | "30" | "all") => void;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {impactSummary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Completed donations</CardTitle>
            <CardDescription>Review completed deliveries with pickup and delivery timestamps.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "all", label: "All time" },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={historyFilter === filter.value ? "default" : "glass"}
                size="sm"
                onClick={() => setHistoryFilter(filter.value as "7" | "30" | "all")}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Food type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>NGO partner</TableHead>
                <TableHead>Pickup time</TableHead>
                <TableHead>Delivery time</TableHead>
                <TableHead>Final status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item, index) => {
                const timestamps = getHistoryTimestamps(item.date, index);

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.foodType}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.recipient}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {timestamps.pickup.toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {timestamps.delivery.toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">{item.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function ImpactSection({ impactSummary }: { impactSummary: Array<{ label: string; value: string; detail: string }> }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {impactSummary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Meals donated over time</CardTitle>
            <CardDescription>Weekly visibility into how your donor activity contributes to the wider network.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImpactChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contribution snapshot</CardTitle>
            <CardDescription>Key signals tied directly to donor operations and sustainability outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 p-5">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <p className="font-extrabold">People served</p>
              </div>
              <p className="mt-3 font-display text-4xl font-extrabold">{impactSummary[2]?.value}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 p-5">
              <div className="flex items-center gap-3">
                <Leaf className="h-5 w-5 text-accent" />
                <p className="font-extrabold">Food waste reduced</p>
              </div>
              <p className="mt-3 font-display text-4xl font-extrabold">{impactSummary[3]?.value}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <p className="font-extrabold">NGO partners supported</p>
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold">{impactSummary[1]?.value}</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Repeated, successful handoffs help strengthen pickup reliability across your service area.
              </p>
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
      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Donor profile</CardTitle>
            <CardDescription>Core account details used across your donation listings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <UserCircle2 className="h-4 w-4 text-primary" />
              {session.name}
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              {session.organizationName ?? "Independent donor account"}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {session.email}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
            <CardDescription>Stay informed when listings are accepted, picked up, or delivered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" />
              Instant alerts for NGO acceptance and pickup scheduling
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" />
              Delivery confirmation summaries at the end of each handoff
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" />
              Daily digest for active and completed donations
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Address and location preferences</CardTitle>
            <CardDescription>Saved defaults that speed up the posting workflow for recurring pickups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-500" />
              Preferred location: Bandra West, Mumbai
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              Standard pickup window: 7:30 PM - 9:00 PM
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Access notes saved for repeat donation postings
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved donor preferences</CardTitle>
          <CardDescription>Keep your posting flow fast with saved pickup defaults.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 font-medium">
              <Clock3 className="h-4 w-4 text-primary" />
              Default pickup window
            </div>
            <p className="mt-2 text-sm text-muted-foreground">7:30 PM - 9:00 PM</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 font-medium">
              <MapPin className="h-4 w-4 text-warning" />
              Preferred location
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Bandra West, Mumbai</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 font-medium">
              <Package className="h-4 w-4 text-sky-400" />
              Saved packaging note
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Food packed in sealed meal trays with labels.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export function DonorDashboardRouteView({
  page,
  session,
}: {
  page: DonorPageKey;
  session: DemoSession;
}) {
  const data = useDonorDashboardData(session);
  const meta = pageMeta[page];

  return (
    <DashboardShell
      currentPath={meta.currentPath}
      role="donor"
      session={session}
      navItems={donorNavItems}
      title={meta.title}
      subtitle={meta.subtitle}
    >
      {page === "overview" && <OverviewSection overviewStats={data.overviewStats} />}
      {page === "post-donation" && (
        <PostDonationSection
          dialogOpen={data.dialogOpen}
          handleSubmit={data.handleSubmit}
          isSubmitting={data.isSubmitting}
          setDialogOpen={data.setDialogOpen}
          submitSuccess={data.submitSuccess}
        />
      )}
      {page === "active-donations" && (
        <ActiveDonationsSection fetchDonations={data.fetchDonations} liveDonations={data.liveDonations} />
      )}
      {page === "donation-history" && (
        <DonationHistorySection
          filteredHistory={data.filteredHistory}
          historyFilter={data.historyFilter}
          impactSummary={data.impactSummary}
          setHistoryFilter={data.setHistoryFilter}
        />
      )}
      {page === "impact" && <ImpactSection impactSummary={data.impactSummary} />}
      {page === "settings" && <SettingsSection session={session} />}
    </DashboardShell>
  );
}

export function DonorDashboardView({ session }: { session: DemoSession }) {
  return <DonorDashboardRouteView page="overview" session={session} />;
}
