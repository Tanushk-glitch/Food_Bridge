"use client";

import { useCallback, useEffect, useState } from "react";
import { Bike, CheckCircle2, Loader2, Map as MapIcon, Package, PackageCheck, Truck } from "lucide-react";

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
  ngo?: { name: string; email: string } | null;
};

export function DeliveryDashboardClient({ session }: { session: DemoSession }) {
  const [pickups, setPickups] = useState<DbDonation[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchPickups = useCallback(async () => {
    try {
      const res = await fetch("/api/delivery/requests");
      const data = await res.json();
      if (data.requests) {
        setPickups(data.requests);
      }
    } catch (err) {
      console.error("Failed to fetch pickups:", err);
    }
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchPickups();
    const interval = setInterval(fetchPickups, 5000);
    return () => clearInterval(interval);
  }, [fetchPickups]);

  async function handleAccept(donationId: string) {
    setActionInProgress(donationId);
    try {
      const res = await fetch("/api/delivery/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId, deliveryAgentId: session.email }),
      });
      if (res.ok) {
        await fetchPickups();
      }
    } catch (err) {
      console.error("Failed to accept delivery:", err);
    } finally {
      setActionInProgress(null);
    }
  }

  async function handlePickup(donationId: string) {
    setActionInProgress(donationId);
    try {
      const res = await fetch("/api/delivery/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
      });
      if (res.ok) {
        await fetchPickups();
      }
    } catch (err) {
      console.error("Failed to mark pickup:", err);
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleDeliver(donationId: string) {
    setActionInProgress(donationId);
    try {
      const res = await fetch("/api/delivery/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
      });
      if (res.ok) {
        await fetchPickups();
      }
    } catch (err) {
      console.error("Failed to mark delivery:", err);
    } finally {
      setActionInProgress(null);
    }
  }

  const stats = [
    { label: "Pickup requests", value: String(pickups.length), detail: "Active active deliveries" },
    { label: "Auto-refresh", value: "5s", detail: "Dashboard updates live" },
    { label: "Status", value: "Active", detail: "Ready for field operations" },
  ];

  function getStatusLabel(status: string) {
    switch (status) {
      case "NGO_ACCEPTED":
        return "Requested";
      case "DELIVERY_ACCEPTED":
        return "Accepted";
      case "PICKED_UP":
        return "Picked Up";
      default:
        return status;
    }
  }

  return (
    <DashboardShell
      currentPath="/dashboard/delivery"
      role="delivery"
      session={session}
      title="Delivery Dashboard"
      subtitle="Handle pickup requests, update every delivery milestone in real time."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Route Map</CardTitle>
          <CardDescription>Visualize active pickups and delivery routes.</CardDescription>
        </CardHeader>
        <CardContent>
          <LiveDonationMap
            donations={pickups.filter(d => d.status === "DELIVERY_ACCEPTED" || d.status === "PICKED_UP")}
            mode="DELIVERY"
            userEmail={session.email}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Delivery Tasks</CardTitle>
              <CardDescription>Accept requests, track pickups, and mark completed deliveries.</CardDescription>
            </div>
            <Button variant="glass" size="sm" onClick={fetchPickups}>
              Refresh now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pickups.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {pickups.map((task) => {
                const badgeVariant = task.status === "NGO_ACCEPTED" ? "default" : task.status === "DELIVERY_ACCEPTED" ? "warning" : "info";

                return (
                  <Card
                    key={task.id}
                    className="bg-background/70 transition-all duration-300"
                  >
                    <CardContent className="mt-0 space-y-5 p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{task.id.slice(0, 8)}</p>
                          <h3 className="mt-2 font-display text-xl font-semibold">{task.foodType}</h3>
                        </div>
                        <Badge variant={badgeVariant}>{getStatusLabel(task.status)}</Badge>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-primary" />
                          Donor: {task.donor?.name || task.donorId}
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-accent" />
                          NGO: {task.ngo?.name || task.ngoId || "—"}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapIcon className="h-4 w-4 text-warning" />
                          {task.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Bike className="h-4 w-4 text-sky-500" />
                          {task.quantity} · Expires: {task.expiryTime}
                        </div>
                      </div>

                      <div className="pt-2">
                        {task.status === "NGO_ACCEPTED" && (
                          <Button
                            className="w-full"
                            disabled={actionInProgress === task.id}
                            onClick={() => handleAccept(task.id)}
                          >
                            {actionInProgress === task.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Truck className="mr-2 h-4 w-4" />
                            )}
                            Accept Delivery
                          </Button>
                        )}
                        {task.status === "DELIVERY_ACCEPTED" && (
                          <Button
                            className="w-full"
                            disabled={actionInProgress === task.id}
                            onClick={() => handlePickup(task.id)}
                          >
                            {actionInProgress === task.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <PackageCheck className="mr-2 h-4 w-4" />
                            )}
                            Mark Picked Up
                          </Button>
                        )}
                        {task.status === "PICKED_UP" && (
                          <Button
                            className="w-full"
                            disabled={actionInProgress === task.id}
                            onClick={() => handleDeliver(task.id)}
                          >
                            {actionInProgress === task.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-semibold text-muted-foreground">No active delivery tasks</p>
              <p className="text-sm text-muted-foreground">
                When NGOs accept donations, they will appear here automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
