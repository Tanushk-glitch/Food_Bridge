import { chartData } from "@/lib/data";

export function ImpactChart() {
  const maxMeals = Math.max(...chartData.map((item) => item.meals));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-7 gap-3">
        {chartData.map((item) => (
          <div key={item.day} className="flex flex-col items-center gap-3">
            <div className="flex h-48 items-end">
              <div
                className="w-9 rounded-full bg-gradient-to-t from-primary via-emerald-400 to-warning shadow-glow"
                style={{ height: `${(item.meals / maxMeals) * 100}%` }}
              />
            </div>
            <div className="text-center">
              <div className="text-xs font-medium">{item.day}</div>
              <div className="text-xs text-muted-foreground">{item.meals}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 rounded-[24px] border border-white/15 bg-white/35 p-4 text-sm dark:bg-white/5 sm:grid-cols-3">
        <div>
          <p className="text-muted-foreground">Avg meals / day</p>
          <p className="mt-1 font-display text-2xl font-semibold">379</p>
        </div>
        <div>
          <p className="text-muted-foreground">Pickup success</p>
          <p className="mt-1 font-display text-2xl font-semibold">96.4%</p>
        </div>
        <div>
          <p className="text-muted-foreground">Spoilage prevented</p>
          <p className="mt-1 font-display text-2xl font-semibold">12.8 tons</p>
        </div>
      </div>
    </div>
  );
}
