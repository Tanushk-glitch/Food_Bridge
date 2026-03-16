import { Activity, Eye, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { activeDonations, adminOrganizations } from "@/lib/data";
import { getSession } from "@/lib/auth";

export default function AdminPage() {
  const session = getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <DashboardShell
      currentPath="/admin"
      role="admin"
      session={session}
      title="Admin Dashboard"
      subtitle="Manage users, verify NGOs, monitor active donations, and watch platform analytics from one restricted console."
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="mt-0 p-5"><Users className="h-5 w-5 text-primary" /><p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Managed users</p><p className="mt-2 font-display text-3xl font-extrabold">186</p></CardContent></Card>
        <Card><CardContent className="mt-0 p-5"><Activity className="h-5 w-5 text-accent" /><p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Monitored donations</p><p className="mt-2 font-display text-3xl font-extrabold">24</p></CardContent></Card>
        <Card><CardContent className="mt-0 p-5"><ShieldCheck className="h-5 w-5 text-primary" /><p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">NGO verification queue</p><p className="mt-2 font-display text-3xl font-extrabold">7</p></CardContent></Card>
        <Card><CardContent className="mt-0 p-5"><Eye className="h-5 w-5 text-accent" /><p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Incidents flagged</p><p className="mt-2 font-display text-3xl font-extrabold">2</p></CardContent></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Manage users</CardTitle>
            <CardDescription>Verification state and activity across the network.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminOrganizations.map((org) => (
                  <TableRow key={org.name}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.type}</TableCell>
                    <TableCell>{org.city}</TableCell>
                    <TableCell>{org.listings}</TableCell>
                    <TableCell><Badge variant={org.health === "Verified" ? "success" : org.health === "Active" ? "info" : "warning"}>{org.health}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitor donations</CardTitle>
            <CardDescription>Inspect urgent listings and coordinate intervention when needed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeDonations.map((listing) => (
              <div key={listing.id} className="rounded-3xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{listing.id}</p>
                    <p className="mt-2 font-medium">{listing.foodType}</p>
                  </div>
                  <Badge variant={listing.status === "Expiring Soon" ? "warning" : "success"}>{listing.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{listing.location}</p>
                <div className="mt-4 flex gap-3">
                  <Button variant="glass" className="flex-1">Review</Button>
                  <Button className="flex-1">Contact partner</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
