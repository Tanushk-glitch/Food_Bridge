import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightLeft, Bike, Building2, HeartHandshake, LayoutDashboard, Leaf, LogOut, ShieldCheck, type LucideIcon } from "lucide-react";

import { logoutAction } from "@/app/auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getRoleLabel, type UserRole } from "@/lib/roles";
import type { DemoSession } from "@/lib/session-types";
import { cn } from "@/lib/utils";

type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: string[];
};

const linkGroups: Record<UserRole, DashboardNavItem[]> = {
  donor: [
    { href: "/dashboard/donor", label: "Dashboard", icon: Building2 },
    { href: "/dashboard/donor#post-donation", label: "Post Donation", icon: ArrowRightLeft },
    { href: "/dashboard/donor#active-donations", label: "Active Donations", icon: LayoutDashboard },
    { href: "/dashboard/donor#donation-history", label: "Donation History", icon: LayoutDashboard },
    { href: "/impact", label: "Impact", icon: LayoutDashboard }
  ],
  ngo: [
    { href: "/dashboard/ngo", label: "NGO Dashboard", icon: HeartHandshake },
    { href: "/dashboard/ngo#nearby", label: "Browse Donations", icon: LayoutDashboard },
    { href: "/dashboard/ngo#tracking", label: "Distribution Tracking", icon: ArrowRightLeft },
    { href: "/impact", label: "Impact", icon: LayoutDashboard }
  ],
  delivery: [
    { href: "/dashboard/delivery", label: "Delivery Dashboard", icon: Bike },
    { href: "/dashboard/delivery#routes", label: "My Routes", icon: ArrowRightLeft },
    { href: "/dashboard/delivery#pickups", label: "Pickup Requests", icon: LayoutDashboard },
    { href: "/impact", label: "Impact", icon: LayoutDashboard }
  ],
  admin: [
    { href: "/admin", label: "Admin Console", icon: ShieldCheck },
    { href: "/impact", label: "Impact", icon: LayoutDashboard }
  ]
};

export function DashboardShell({
  title,
  subtitle,
  currentPath,
  role,
  session,
  navItems,
  children
}: {
  title: string;
  subtitle: string;
  currentPath: string;
  role: UserRole;
  session: DemoSession;
  navItems?: DashboardNavItem[];
  children: ReactNode;
}) {
  const resolvedNavItems = navItems ?? linkGroups[role];

  return (
    <div className="min-h-screen bg-background radial-glow">
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar — light theme matching landing page */}
          <aside className="flex h-fit flex-col gap-5 rounded-3xl border border-border bg-card p-4 shadow-soft lg:sticky lg:top-6">
            {/* Logo — identical to navbar */}
            <Link href="/" className="flex items-center gap-2.5 rounded-2xl px-3 py-3 transition hover:bg-muted">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-extrabold tracking-tight">FoodBridge</div>
                <div className="text-xs font-medium text-muted-foreground">{getRoleLabel(role)} workspace</div>
              </div>
            </Link>

            {/* User card */}
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Signed in</p>
              <p className="mt-2 font-extrabold">{session.name}</p>
              <p className="text-sm font-medium text-muted-foreground">{session.organizationName ?? session.email}</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {resolvedNavItems.map((link) => {
                const Icon = link.icon;
                const isActive = currentPath === link.href || link.match?.includes(currentPath);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <form action={logoutAction}>
              <Button type="submit" variant="glass" className="w-full border-border">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </form>
          </aside>

          {/* Main content */}
          <main className="space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">FoodBridge dashboard</p>
                <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
                <p className="mt-2 max-w-2xl font-medium text-muted-foreground">{subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button variant="glass" className="border-border">Live updates enabled</Button>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
