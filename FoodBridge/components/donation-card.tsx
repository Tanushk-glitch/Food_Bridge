import { Clock3, MapPin, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCountdown } from "@/lib/utils";

type DonationCardProps = {
  title: string;
  quantity: string;
  location: string;
  status: string;
  subtitle?: string;
  expiryTime?: string;
  primaryAction?: string;
  secondaryAction?: string;
};

export function DonationCard({
  title,
  quantity,
  location,
  status,
  subtitle,
  expiryTime,
  primaryAction,
  secondaryAction
}: DonationCardProps) {
  const badgeVariant = status === "Expiring Soon" ? "warning" : status === "NGO Accepted" || status === "Picked Up" || status === "Pickup Scheduled" ? "info" : "success";

  return (
    <div className="group rounded-3xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:border-primary/30 hover:shadow-primary-hover">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-extrabold">{title}</h3>
            {subtitle ? <p className="mt-2 text-sm font-medium text-muted-foreground">{subtitle}</p> : null}
          </div>
          <Badge variant={badgeVariant}>{status}</Badge>
        </div>
        <div className="grid gap-3 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            {quantity}
          </div>
          {expiryTime ? (
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-accent" />
              Expires in {getCountdown(expiryTime)}
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {location}
          </div>
        </div>
        {primaryAction || secondaryAction ? (
          <div className="grid grid-cols-2 gap-3">
            {secondaryAction ? <Button variant="glass">{secondaryAction}</Button> : <div />}
            {primaryAction ? <Button>{primaryAction}</Button> : <div />}
          </div>
        ) : null}
      </div>
    </div>
  );
}
