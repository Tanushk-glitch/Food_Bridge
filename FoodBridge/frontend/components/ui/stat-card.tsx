import { ArrowUpRight } from "lucide-react";

export function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="group rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:border-primary/30 hover:shadow-primary-hover">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className="rounded-full bg-primary/10 p-2 transition-transform group-hover:scale-110">
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-4">
        <div className="font-display text-3xl font-extrabold tracking-tight">{value}</div>
        <p className="mt-2 text-sm font-medium text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
