import { redirect } from "next/navigation";

import { SignupForm } from "@/components/signup-form";
import { SiteHeader } from "@/components/site-header";
import { getDashboardPath, getSession, isUserRole } from "@/lib/auth";

export default function SignupPage({ searchParams }: { searchParams?: { role?: string } }) {
  const session = getSession();

  if (session) {
    redirect(session.onboardingCompleted ? getDashboardPath(session.role) : "/onboarding");
  }

  const role = isUserRole(searchParams?.role) && searchParams?.role !== "admin" ? searchParams.role : null;

  return (
    <div className="min-h-screen radial-glow">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Step 1</p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">How would you like to use FoodBridge?</h1>
            <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground">
              Choose your role first. We&apos;ll tailor account setup and onboarding to match your workflow.
            </p>
          </div>

          <SignupForm initialRole={role} />

          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="grid gap-4 text-sm font-medium text-muted-foreground sm:grid-cols-3">
              <p>Donors post verified surplus food listings with pickup windows and location details.</p>
              <p>NGOs and volunteers review nearby donations, capacity, and distribution readiness.</p>
              <p>Delivery partners receive route-ready pickups and update live delivery milestones.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
