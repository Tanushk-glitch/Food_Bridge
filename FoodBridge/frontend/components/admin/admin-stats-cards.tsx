"use client";

import { useEffect, useState } from "react";
import { Activity, Eye, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type AdminStats = {
  managedUsers: number;
  activeDonations: number;
  ngoVerificationQueue: number;
  incidentsFlagged: number;
};

export function AdminStatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (alive && data) {
          setStats(data);
        }
      })
      .catch(() => {
        if (alive) {
          setStats(null);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const managedUsers = stats?.managedUsers ?? "—";
  const activeDonations = stats?.activeDonations ?? "—";
  const ngoQueue = stats?.ngoVerificationQueue ?? "—";
  const incidents = stats?.incidentsFlagged ?? "—";

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardContent className="mt-0 p-5">
          <Users className="h-5 w-5 text-primary" />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Managed users</p>
          <p className="mt-2 font-display text-3xl font-extrabold">{managedUsers}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="mt-0 p-5">
          <Activity className="h-5 w-5 text-accent" />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Active donations</p>
          <p className="mt-2 font-display text-3xl font-extrabold">{activeDonations}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="mt-0 p-5">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">NGO verification queue</p>
          <p className="mt-2 font-display text-3xl font-extrabold">{ngoQueue}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="mt-0 p-5">
          <Eye className="h-5 w-5 text-accent" />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Incidents flagged</p>
          <p className="mt-2 font-display text-3xl font-extrabold">{incidents}</p>
        </CardContent>
      </Card>
    </div>
  );
}

