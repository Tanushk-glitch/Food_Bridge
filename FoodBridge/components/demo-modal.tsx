"use client";

import { ArrowRight, Clock3, Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function DemoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="glass" size="lg">See Live Flow</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">Live workflow</p>
            <h3 className="mt-2 font-display text-3xl font-semibold">From kitchen surplus to same-evening delivery</h3>
            <p className="mt-3 text-muted-foreground">This modal demonstrates the hackathon-ready donation pipeline with clear status handoffs and strong visual hierarchy.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-background/80"><CardContent className="mt-0 p-4"><Clock3 className="h-5 w-5 text-primary" /><p className="mt-4 font-medium">1. Post</p><p className="mt-2 text-sm text-muted-foreground">Restaurant lists surplus with expiry window.</p></CardContent></Card>
            <Card className="bg-background/80"><CardContent className="mt-0 p-4"><Route className="h-5 w-5 text-warning" /><p className="mt-4 font-medium">2. Match</p><p className="mt-2 text-sm text-muted-foreground">NGO and rider get location-aware assignment.</p></CardContent></Card>
            <Card className="bg-background/80"><CardContent className="mt-0 p-4"><ArrowRight className="h-5 w-5 text-sky-500" /><p className="mt-4 font-medium">3. Deliver</p><p className="mt-2 text-sm text-muted-foreground">Impact updates across all dashboards instantly.</p></CardContent></Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
