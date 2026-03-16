import { ArrowRight, Building2, HeartHandshake, Bike } from "lucide-react";

import { cn } from "@/lib/utils";

type RoleCardProps = {
  title: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
};

const iconMap: Record<string, typeof Building2> = {
  "Donor / Restaurant": Building2,
  "NGO / Volunteer": HeartHandshake,
  "Delivery Partner": Bike
};

export function RoleCard({ title, description, active, onClick }: RoleCardProps) {
  const Icon = iconMap[title] ?? Building2;
  
  return (
    <button type="button" onClick={onClick} className="text-left w-full">
      <div
        className={cn(
          "group h-full rounded-3xl border border-border bg-card p-10 shadow-soft transition-all duration-300 hover:border-primary/40 hover:shadow-primary-hover",
          active && "border-primary bg-primary/5 shadow-primary-hover"
        )}
      >
        <div className="flex h-full flex-col justify-between gap-6">
          <div>
            <div className={cn(
              "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
              active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
            )}>
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="font-display text-2xl font-extrabold">{title}</h3>
            <p className="mt-3 font-medium leading-7 text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            Continue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </button>
  );
}
