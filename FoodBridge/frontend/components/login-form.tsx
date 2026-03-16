"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicRoles, roleContent, type UserRole } from "@/lib/roles";

type LoginFormProps = {
  initialRole?: UserRole;
};

export function LoginForm({ initialRole = "donor" }: LoginFormProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const role = String(formData.get("role") || "donor") as UserRole;
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Unable to log in. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const dashboardPath = roleContent[role]?.dashboardPath || "/dashboard";
    router.push(dashboardPath);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <h3 className="font-display text-xl font-extrabold">Login to your FoodBridge account</h3>
        <p className="mt-2 text-sm font-medium text-muted-foreground">Choose your role context to jump back into your dashboard.</p>
        <form onSubmit={handleLogin} className="mt-6 grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-bold">Role</label>
            <div className="grid gap-3 sm:grid-cols-3">
              {publicRoles.map((role) => (
                <label key={role} className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-sm">
                  <input defaultChecked={initialRole === role} className="sr-only" type="radio" name="role" value={role} />
                  <p className="font-extrabold">{roleContent[role].shortLabel}</p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{roleContent[role].description}</p>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold">Email</label>
            <Input name="email" type="email" placeholder="name@example.com" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold">Password</label>
            <Input name="password" type="password" placeholder="Your account password" required />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Need an account?{" "}
              <Link href="/signup" className="font-bold text-primary">
                Sign up
              </Link>
            </p>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-border bg-foreground p-8 text-background">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/10">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-display text-xl font-extrabold text-background">Restricted admin access</h3>
        <p className="mt-2 text-sm font-medium text-background/70">
          The admin dashboard stays off the public signup flow. Use an admin email to open the operations console.
        </p>
        <div className="mt-6 space-y-4 text-sm font-medium text-background/60">
          <p>Demo tip: any email containing the word &ldquo;admin&rdquo; will route to the admin dashboard after login.</p>
          <p>Example: <span className="font-extrabold text-background">ops-admin@foodbridge.org</span></p>
        </div>
      </div>
    </div>
  );
}
