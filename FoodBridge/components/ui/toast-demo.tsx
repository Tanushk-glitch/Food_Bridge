"use client";

import { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ToastDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Button variant="glass" onClick={() => setVisible(true)}>
        <Bell className="h-4 w-4" />
        Trigger Toast
      </Button>
      {visible ? (
        <div className="absolute right-0 top-14 z-20 w-72 rounded-[24px] border border-white/15 bg-background/95 p-4 shadow-soft backdrop-blur-2xl">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/15 p-2 text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Pickup confirmed</p>
              <p className="text-sm text-muted-foreground">Driver assigned to FDB-202. ETA 12 minutes.</p>
            </div>
          </div>
          <button className="mt-3 text-xs font-medium text-primary" onClick={() => setVisible(false)}>
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}
