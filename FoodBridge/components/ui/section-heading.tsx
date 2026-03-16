export function SectionHeading({ eyebrow, title, description, align = "left" }: { eyebrow: string; title: string; description: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl space-y-4 text-center" : "space-y-4"}>
      <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-extrabold uppercase tracking-[0.24em] text-primary">
        {eyebrow}
      </div>
      <div className="space-y-3">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{title}</h2>
        <p className="text-base font-medium leading-7 text-muted-foreground sm:text-lg">{description}</p>
      </div>
    </div>
  );
}
