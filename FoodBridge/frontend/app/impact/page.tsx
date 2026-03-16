import { BarChart3, IndianRupee, Leaf, PackageCheck } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { ImpactChart } from "@/components/ui/impact-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ToastDemo } from "@/components/ui/toast-demo";

export default function ImpactPage() {
  return (
    <div className="min-h-screen radial-glow">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Live network impact</p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Track sustainability outcomes across the FoodBridge network</h1>
            <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground">
              Public impact reporting shows meals saved, deliveries completed, and operational signals that build trust across donors, NGOs, and logistics teams.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total meals saved" value="48,210" detail="Across all partner restaurants" />
            <StatCard label="Food waste reduced" value="128 tons" detail="Estimated avoided landfill waste" />
            <StatCard label="Successful deliveries" value="8,420" detail="Completed end-to-end handoffs" />
            <StatCard label="Community value" value="Rs 36L" detail="Equivalent meal value delivered" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>Weekly rescue analytics</CardTitle>
                <CardDescription>Meals saved and pickup volume over the last seven days.</CardDescription>
              </CardHeader>
              <CardContent>
                <ImpactChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Live impact signals</CardTitle>
                <CardDescription>Short feedback loops for operations, donors, and community stakeholders.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 p-5">
                  <div className="flex items-center gap-3">
                    <Leaf className="h-5 w-5 text-primary" />
                    <p className="font-extrabold">Landfill diversion rate</p>
                  </div>
                  <p className="mt-3 font-display text-4xl font-extrabold">92.6%</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 p-5">
                  <div className="flex items-center gap-3">
                    <PackageCheck className="h-5 w-5 text-accent" />
                    <p className="font-extrabold">Same-evening fulfillment</p>
                  </div>
                  <p className="mt-3 font-display text-4xl font-extrabold">81%</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <p className="font-extrabold">Top category rescued</p>
                  </div>
                  <p className="mt-3 font-display text-2xl font-extrabold">Prepared meals and grains</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    <p className="font-extrabold">Demo notifications</p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">Use toasts for donor and partner updates.</p>
                  <div className="mt-4">
                    <ToastDemo />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
