"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, Loader2, MapPin, Package, Route, ShieldCheck } from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { LiveDonationMap } from "@/components/live-donation-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import type { DemoSession } from "@/lib/session-types";

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
};

export function NgoDashboardClient({ session }: { session: DemoSession }) {
  const [donations, setDonations] = useState<DbDonation[]>([]);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

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

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchOpenDonations();
    const interval = setInterval(fetchOpenDonations, 5000);
    return () => clearInterval(interval);
  }, [fetchOpenDonations]);

  async function handleAccept(donationId: string) {
    setAccepting(donationId);
    try {
      const res = await fetch("/api/donations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId, ngoId }),
      });

      if (res.ok) {
        setAccepted((prev) => new Set(prev).add(donationId));
        // Remove from list after a brief success animation
        setTimeout(() => {
          setDonations((prev) => prev.filter((d) => d.id !== donationId));
          setAccepted((prev) => {
            const next = new Set(prev);
            next.delete(donationId);
            return next;
          });
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to accept donation:", err);
    } finally {
      setAccepting(null);
    }
  }

  const stats = [
    { label: "Open donations", value: String(donations.length), detail: "Available for pickup" },
    { label: "Accepted today", value: String(accepted.size), detail: "By your organization" },
    { label: "Auto-refresh", value: "5s", detail: "Dashboard updates live" },
  ];

  return (
    <DashboardShell
      currentPath="/dashboard/ngo"
      role="ngo"
      session={session}
      title="NGO Dashboard"
      subtitle="Review nearby donations, accept pickups, and coordinate distribution across your service area."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Donation Map</CardTitle>
          <CardDescription>Visualize nearby food donations and optimize your pickup planning.</CardDescription>
        </CardHeader>
        <CardContent>
          <LiveDonationMap
            donations={donations}
            mode="NGO"
            userEmail={ngoId}
            onAcceptPickup={handleAccept}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Donations</CardTitle>
              <CardDescription>Food posted by donors — accept to schedule a pickup. Refreshes every 5 seconds.</CardDescription>
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
                  className={
                    "group rounded-3xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:border-primary/30 hover:shadow-primary-hover" +
                    (accepted.has(donation.id) ? " border-green-500/40 bg-green-500/5" : "")
                  }
                >
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl font-extrabold">{donation.foodType}</h3>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">
                          by {donation.donor?.name || donation.donorId}
                        </p>
                      </div>
                      {accepted.has(donation.id) ? (
                        <Badge variant="success">Accepted ✓</Badge>
                      ) : (
                        <Badge variant="default">Posted</Badge>
                      )}
                    </div>
                    <div className="grid gap-3 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        {donation.quantity}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {donation.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-warning" />
                        Expires: {donation.expiryTime}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="glass" size="sm">Review</Button>
                      {accepted.has(donation.id) ? (
                        <Button disabled size="sm" className="bg-green-600 text-white">
                          <CheckCircle2 className="h-4 w-4" />
                          Accepted
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={accepting === donation.id}
                          onClick={() => handleAccept(donation.id)}
                        >
                          {accepting === donation.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Accepting...
                            </>
                          ) : (
                            "Accept Pickup"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-semibold text-muted-foreground">No open donations</p>
              <p className="text-sm text-muted-foreground">
                When donors post surplus food, it will appear here automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
    </DashboardShell>
  );
}
