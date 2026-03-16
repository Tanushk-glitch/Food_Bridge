"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Clock3, Eye, History, MapPin, Package, PencilLine, PlusCircle, Settings, XCircle, Loader2, CheckCircle2 } from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { donationHistory, donorStats } from "@/lib/data";
import type { DemoSession } from "@/lib/session-types";
import { cn } from "@/lib/utils";

const donorNavItems = [
  { href: "/dashboard/donor", label: "Dashboard", icon: BarChart3, match: ["/dashboard/donor"] },
  { href: "/dashboard/donor#post-donation", label: "Post Donation", icon: PlusCircle },
  { href: "/dashboard/donor#active-donations", label: "Active Donations", icon: Package },
  { href: "/dashboard/donor#donation-history", label: "Donation History", icon: History },
  { href: "/impact", label: "Impact", icon: BarChart3 },
  { href: "/dashboard/donor#settings", label: "Settings", icon: Settings }
];

type DonationStatusType = "POSTED" | "NGO_ACCEPTED" | "DELIVERY_ACCEPTED" | "PICKED_UP" | "DELIVERED";

const donorStages: DonationStatusType[] = ["POSTED", "NGO_ACCEPTED", "DELIVERY_ACCEPTED", "PICKED_UP", "DELIVERED"];

const statusLabels: Record<DonationStatusType, string> = {
  POSTED: "Posted",
  NGO_ACCEPTED: "NGO Accepted",
  DELIVERY_ACCEPTED: "Delivery Accepted",
  PICKED_UP: "Picked Up",
  DELIVERED: "Delivered",
};

function getStatusVariant(status: DonationStatusType) {
  if (status === "DELIVERED") return "success" as const;
  if (status === "PICKED_UP" || status === "DELIVERY_ACCEPTED") return "info" as const;
  if (status === "NGO_ACCEPTED") return "info" as const;
  return "default" as const;
}

function getProgressValue(status: DonationStatusType) {
  const index = donorStages.indexOf(status);
  if (index === -1) return 20;
  return ((index + 1) / donorStages.length) * 100;
}

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

export function DonorDashboardView({ session }: { session: DemoSession }) {
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

  // Initial fetch + auto-refresh every 5 seconds
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
    const expiryTime = formData.get("expiryTime") as string;
    const location = formData.get("location") as string;

    try {
      const res = await fetch("/api/donations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodType,
          quantity,
          expiryTime,
          location,
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

  // Computed stats from live data
  const activeDonations = liveDonations.filter((d) => d.status !== "DELIVERED");
  const deliveredCount = liveDonations.filter((d) => d.status === "DELIVERED").length;
  const pickupScheduled = liveDonations.filter((d) => d.status === "NGO_ACCEPTED" || d.status === "DELIVERY_ACCEPTED").length;

  const liveStats = [
    { label: "Active Donations", value: String(activeDonations.length), detail: "Currently open" },
    { label: "Total Posted", value: String(liveDonations.length), detail: "All time" },
    { label: "Pickups Pending", value: String(pickupScheduled), detail: "Awaiting pickup" },
    { label: "Successful Deliveries", value: String(deliveredCount), detail: "Completed" },
  ];

  return (
    <DashboardShell
      currentPath="/dashboard/donor"
      role="donor"
      session={session}
      navItems={donorNavItems}
      title="Donor Dashboard"
      subtitle="Post surplus food quickly and keep every donation moving from listing to successful delivery."
    >
      <Card id="post-donation" className="overflow-hidden border-primary/20">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
        <CardContent className="relative mt-0 flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Primary action</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">Post surplus food in under a minute</h2>
            <p className="mt-3 font-medium text-muted-foreground">
              Create a donation listing with pickup timing, food details, and location so NGOs can respond fast.
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
                 <p className="text-sm font-medium text-muted-foreground">Share the essentials so NGOs can review and schedule pickup quickly.</p>
              </div>
              {submitSuccess ? (
                <div className="mt-6 flex flex-col items-center gap-4 py-8">
                  <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-300" />
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
                    <label className="mb-2 block text-sm font-medium">Expiry time</label>
                    <Input name="expiryTime" placeholder="10:30 PM tonight" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Location</label>
                    <Input name="location" placeholder="Koramangala, Bengaluru" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Pickup note (optional)</label>
                    <Textarea name="note" placeholder="Packaging notes, entry instructions, or food handling guidance..." />
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
                          Publish donation
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(liveDonations.length > 0 ? liveStats : donorStats).map((stat) => (
           <Card key={stat.label} className="rounded-3xl p-0">
            <CardContent className="mt-0 p-4">
               <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
               <p className="mt-3 font-display text-3xl font-extrabold">{stat.value}</p>
               <p className="mt-1 text-sm font-medium text-muted-foreground">{stat.detail}</p>
             </CardContent>
          </Card>
        ))}
      </section>

      <Card id="active-donations">
        <CardHeader>
          <CardTitle>Active donations</CardTitle>
          <CardDescription>
            {liveDonations.length > 0
              ? "Live data from your posted donations — refreshes every 5 seconds."
              : "Current listings that still need confirmation, pickup, or delivery completion."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {liveDonations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Food item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>NGO assigned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <p className="font-medium">{donation.foodType}</p>
                    </TableCell>
                    <TableCell>{donation.quantity}</TableCell>
                    <TableCell>{donation.location}</TableCell>
                    <TableCell>{donation.ngo?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(donation.status)}>
                        {statusLabels[donation.status] || donation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(donation.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-semibold text-muted-foreground">No donations yet</p>
              <p className="text-sm text-muted-foreground">Post your first surplus food donation to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {liveDonations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Donation status tracker</CardTitle>
            <CardDescription>Follow each donation from posting through NGO acceptance, pickup, and delivery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveDonations.map((donation) => (
              <div key={donation.id} className="rounded-3xl border border-border bg-muted/30 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium">{donation.foodType}</p>
                    <p className="text-sm text-muted-foreground">
                      {donation.quantity} · {donation.location}
                      {donation.ngo ? ` · ${donation.ngo.name}` : ""}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(donation.status)}>
                    {statusLabels[donation.status] || donation.status}
                  </Badge>
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

      <Card id="donation-history">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Donation history</CardTitle>
            <CardDescription>Review completed donations and recent partner handoffs.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "all", label: "All time" }
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
                <TableHead>Date</TableHead>
                <TableHead>Final status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.foodType}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.recipient}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</TableCell>
                  <TableCell>
                    <Badge variant="success">{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card id="settings">
        <CardHeader>
          <CardTitle>Donor settings</CardTitle>
          <CardDescription>Keep your posting flow fast with saved pickup preferences.</CardDescription>
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
    </DashboardShell>
  );
}
