import Link from "next/link";

import { MotionReveal } from "@/components/motion-reveal";
import { SiteHeader } from "@/components/site-header";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "1. Post Surplus",
    description: "Businesses list available food in seconds via our intuitive dashboard with photo and dietary details.",
    iconBg: "bg-primary/10 text-primary",
    icon: "post_add"
  },
  {
    title: "2. NGO Alerts",
    description: "Nearby NGOs receive instant notifications based on their specific needs and community requirements.",
    iconBg: "bg-accent/10 text-accent",
    icon: "notifications_active"
  },
  {
    title: "3. Rapid Delivery",
    description: "Volunteers or logistics partners ensure rapid and safe delivery directly to the community in need.",
    iconBg: "bg-foreground text-background",
    icon: "local_shipping"
  }
];

const impactStats = [
  { label: "Meals Rescued", value: 48210, suffix: "+" },
  { label: "Waste Prevented", value: 128, suffix: " Tons" },
  { label: "Partner NGOs", value: 186, suffix: "+" }
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden radial-glow">
      <SiteHeader />
      <main>
        {/* Hero section */}
        <section className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:pt-20">
          <MotionReveal>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Join the Movement
                </div>
                <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-balance lg:text-7xl">
                  Reducing Food Waste.{" "}
                  <br />
                  <span className="text-primary">Feeding Communities.</span>
                </h1>
                <p className="max-w-xl text-lg font-medium leading-relaxed text-muted-foreground">
                  A smarter way to redistribute surplus food. We connect local businesses with NGOs in real-time, ensuring nothing good goes to waste.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Button asChild size="lg" className="px-8 py-4 text-base shadow-xl shadow-primary/20">
                    <Link href="/signup?role=donor">Donate Surplus Food</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="px-8 py-4 text-base">
                    <Link href="/signup?role=ngo">Accept Donations (NGO)</Link>
                  </Button>
                </div>
              </div>
            <div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-primary/10 bg-primary/5 shadow-2xl shadow-muted">
                  {/* Texture overlay */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 40L40 0H20L0 20M40 40V20L20 40\" fill=\"%23e2e8f0\" fill-opacity=\"0.4\"/%3E%3C/svg%3E')" }} />
                  {/* Map background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  
                  {/* Pinging map markers */}
                  <div className="absolute left-1/4 top-1/3">
                    <span className="relative flex h-6 w-6">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                      <span className="relative inline-flex h-6 w-6 rounded-full border-4 border-white bg-primary shadow-lg" />
                    </span>
                  </div>
                  <div className="absolute bottom-1/4 right-1/3">
                    <span className="relative flex h-6 w-6">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                      <span className="relative inline-flex h-6 w-6 rounded-full border-4 border-white bg-primary shadow-lg" />
                    </span>
                  </div>
                  <div className="absolute right-1/4 top-1/2 text-accent">
                    <svg className="h-10 w-10 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>

                  {/* Glassmorphic floating cards */}
                  <div className="glass-card absolute right-8 top-8 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/20 p-2 text-primary">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tighter text-foreground">Live Activity</p>
                        <p className="text-sm font-extrabold text-foreground">24 Active Donations nearby</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card absolute bottom-8 left-8 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-accent/20 p-2 text-accent">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-14.3 0L3.62 8.57A1.5 1.5 0 0 1 5 6h14a1.5 1.5 0 0 1 1.38 2.57zM12 2v4M4 22l4-8M20 22l-4-8" /></svg>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tighter text-foreground">Logistics</p>
                        <p className="text-sm font-extrabold text-foreground">18m Avg. Pickup</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
          </MotionReveal>

          {/* Impact stats bar */}
          <MotionReveal delay={0.2}>
            <div className="mt-24 grid grid-cols-1 gap-8 rounded-3xl border border-border bg-card px-8 py-12 shadow-soft md:grid-cols-3">
              {impactStats.map((stat, index) => (
                <div key={stat.label} className={`flex flex-col items-center space-y-3 md:items-start ${index < impactStats.length - 1 ? "border-border md:border-r" : ""} pr-8`}>
                  <p className="text-sm font-extrabold uppercase tracking-widest text-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold text-foreground lg:text-5xl">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </MotionReveal>
        </section>

        {/* Trust section */}
        <section id="partners" className="border-y border-border bg-muted/50 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-12 text-center text-xs font-black uppercase tracking-[0.25em] text-foreground">
              Trusted by Restaurants & NGOs Worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale md:gap-20">
              {["The Green Fork", "CareServe", "Harvest Suites", "Feed Hope", "SwiftRelief"].map((name) => (
                <div key={name} className="flex h-9 items-center rounded-lg bg-muted px-4 text-sm font-extrabold tracking-tight text-muted-foreground">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-32">
          <div className="mb-20 space-y-4 text-center">
            <h2 className="font-display text-4xl font-extrabold tracking-tight">How It Works</h2>
            <p className="mx-auto max-w-xl text-lg font-medium text-muted-foreground">
              Our platform streamlines the process of food redistribution through real-time alerts and efficient logistics.
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {features.map((feature, index) => (
              <MotionReveal key={feature.title} delay={index * 0.08}>
                <div className="group rounded-3xl border border-border bg-card p-10 transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${feature.iconBg}`}>
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                      {feature.icon === "post_add" && <path d="M17 19.22H5V7h7V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h-2v7.22z M19 2h-2v3h-3c.01.01 0 2 0 2h3v2.99c.01.01 2 0 2 0V7h3V5h-3V2z M7 9h8v2H7V9z M7 12h8v2H7v-2z M7 15h5v2H7v-2z" />}
                      {feature.icon === "notifications_active" && <path d="M7.58 4.08L6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2c.15-2.65 1.51-4.97 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43c2.02 1.45 3.39 3.77 3.54 6.42zM18 11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2v-5zm-6 11c.14 0 .27-.01.4-.04.65-.14 1.18-.58 1.44-1.18.1-.24.15-.5.15-.78h-4c.01 1.1.9 2 2.01 2z" />}
                      {feature.icon === "local_shipping" && <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />}
                    </svg>
                  </div>
                  <h3 className="mb-3 font-display text-xl font-extrabold">{feature.title}</h3>
                  <p className="font-medium leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </section>

        {/* About section */}
        <section id="about" className="mx-auto max-w-7xl px-6 pb-16">
          <MotionReveal>
            <div className="overflow-hidden rounded-3xl bg-foreground p-8 text-background lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-background/50">Built for Scale</p>
                  <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-balance">
                    Startup-grade operations layer for sustainable food recovery
                  </h2>
                  <p className="mt-4 max-w-xl font-medium text-background/70">
                    Clean dashboards, mobile-ready flows, live status states, and analytics that make impact visible for teams, funders, and city partners.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Meals Saved", value: 48210, suffix: "+" },
                    { label: "Food Waste Reduced", value: 128, suffix: " tons" },
                    { label: "Partner NGOs", value: 186, suffix: "+" },
                    { label: "Cities Activated", value: 24, suffix: "" }
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-3xl border border-background/10 bg-background/5 p-5">
                      <p className="text-sm text-background/60">{stat.label}</p>
                      <p className="mt-3 font-display text-3xl font-extrabold">
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MotionReveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl border-t border-border px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1 text-primary-foreground">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6.05 4.14l-.39-.39c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l.39.39c.39.39 1.02.39 1.41 0 .39-.38.39-1.02 0-1.41zM3.01 10.5H1.99c-.55 0-1 .45-1 1s.45 1 1 1h1.02c.55 0 1-.45 1-1s-.44-1-1-1zm9-9.95c-.55 0-1 .45-1 1v1.02c0 .55.45 1 1 1s1-.45 1-1V1.55c0-.55-.45-1-1-1zm7.45 3.91c-.39-.39-1.02-.39-1.41 0l-.39.39c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l.39-.39c.39-.39.39-1.03 0-1.41zm-3.21 12.54l.39.39c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.39-.39c-.39-.39-1.02-.38-1.41 0-.39.39-.39 1.02 0 1.41zM22 10.5h-1.02c-.55 0-1 .45-1 1s.45 1 1 1H22c.55 0 1-.45 1-1s-.45-1-1-1z" /></svg>
            </div>
            <h2 className="font-display text-lg font-extrabold tracking-tight">FoodBridge</h2>
          </div>
          <p className="text-sm font-bold tracking-tight text-muted-foreground">© 2024 FoodBridge. Sustainability through connection.</p>
          <div className="flex items-center gap-3">
            <Button asChild variant="glass">
              <Link href="/impact">Explore Impact</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Create an Account</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
