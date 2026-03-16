import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { SiteHeader } from "@/components/site-header";
import { getDashboardPath, getSession, isUserRole, type UserRole } from "@/lib/auth";

export default function LoginPage({ searchParams }: { searchParams?: { role?: string } }) {
  const session = getSession();

  if (session) {
    redirect(session.onboardingCompleted ? getDashboardPath(session.role) : "/onboarding");
  }

  const initialRole: UserRole =
    isUserRole(searchParams?.role) && searchParams?.role !== "admin" ? searchParams.role : "donor";

  return (
    <div className="min-h-screen radial-glow">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Welcome back</p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Login and continue the rescue flow</h1>
            <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground">
              Dashboards are role-based now, so we&apos;ll route you directly to the right workspace after login.
            </p>
          </div>
          <LoginForm initialRole={initialRole} />
        </div>
      </main>
    </div>
  );
}
