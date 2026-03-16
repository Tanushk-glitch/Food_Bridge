import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

type Event = {
  label: string;
  time: string;
  state: "done" | "current" | "upcoming";
};

export function StatusTimeline({ events }: { events: Event[] }) {
  return (
    <div className="space-y-5">
      {events.map((event, index) => (
        <div key={event.label} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border",
                event.state === "done" && "border-primary bg-primary text-primary-foreground",
                event.state === "current" && "border-warning bg-warning text-white animate-pulseGlow",
                event.state === "upcoming" && "border-border bg-background"
              )}
            >
              {event.state === "done" ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            </div>
            {index !== events.length - 1 && <div className="mt-2 h-full w-px bg-border" />}
          </div>
          <div className="pb-6">
            <div className="text-sm font-medium">{event.label}</div>
            <div className="text-sm text-muted-foreground">{event.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
