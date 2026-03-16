"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AdminDonationRow = {
  id: string;
  foodTitle: string;
  quantity: string;
  donorId: string;
  ngoId: string | null;
  pickupStatus: string | null;
  status: string;
  createdAt: string;
};

function badgeForStatus(status: string) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("cancel")) return <Badge variant="warning">Cancelled</Badge>;
  if (normalized.includes("deliver")) return <Badge variant="success">Delivered</Badge>;
  if (normalized.includes("accept") || normalized.includes("claim")) return <Badge variant="info">Claimed</Badge>;
  return <Badge variant="default">Active</Badge>;
}

export function AdminDonationsPanel() {
  const [donations, setDonations] = useState<AdminDonationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/donations");
    const data = await res.json().catch(() => ({}));
    setDonations(Array.isArray(data?.donations) ? data.donations : []);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const top = useMemo(() => donations.slice(0, 5), [donations]);

  async function cancelDonation(id: string) {
    try {
      setBusy(id);
      const res = await fetch(`/api/admin/donations/${encodeURIComponent(id)}/cancel`, { method: "PATCH" });
      if (res.ok) {
        await load();
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitor donations</CardTitle>
        <CardDescription>Inspect active listings and intervene when needed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && top.length === 0 && <p className="text-sm text-muted-foreground">No donations found.</p>}
        {!loading &&
          top.map((donation) => (
            <div key={donation.id} className="rounded-3xl border border-border bg-muted/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{donation.id}</p>
                  <p className="mt-2 font-medium">{donation.foodTitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{donation.quantity}</p>
                </div>
                {badgeForStatus(donation.status)}
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="glass"
                  className="flex-1"
                  disabled={busy === donation.id || String(donation.status || "").toLowerCase().includes("deliver")}
                  onClick={() => cancelDonation(donation.id)}
                >
                  {busy === donation.id ? "Cancelling…" : "Cancel donation"}
                </Button>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

