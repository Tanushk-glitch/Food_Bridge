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
  const [step, setStep] = useState<"details" | "otp">("details");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingRole, setPendingRole] = useState<UserRole>(initialRole);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleRequestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const role = String(formData.get("role") || "donor") as UserRole;
    const email = String(formData.get("email") || "").trim();

    const response = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "login", role, email })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Unable to send OTP. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setPendingEmail(email);
    setPendingRole(role);
    setStep("otp");
    setIsSubmitting(false);
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "login",
        role: pendingRole,
        email: pendingEmail,
        otp
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Invalid OTP. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const dashboardPath = roleContent[pendingRole]?.dashboardPath || "/dashboard";
    router.push(dashboardPath);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <h3 className="font-display text-xl font-extrabold">Login to your FoodBridge account</h3>
        <p className="mt-2 text-sm font-medium text-muted-foreground">Choose your role context to jump back into your dashboard.</p>
        {step === "details" ? (
          <form onSubmit={handleRequestOtp} className="mt-6 grid gap-4">
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
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Need an account?{" "}
                <Link href="/signup" className="font-bold text-primary">
                  Sign up
                </Link>
              </p>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Sending OTP..." : "Send OTP"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
              <p className="font-semibold">We sent a 5-digit code to {pendingEmail}.</p>
              <p className="text-muted-foreground">Enter it below to access your dashboard.</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">Verification code</label>
              <Input
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 5))}
                inputMode="numeric"
                placeholder="12345"
                required
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep("details")}>
                Edit details
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting || otp.length !== 5}>
                {isSubmitting ? "Verifying..." : "Verify & login"}
              </Button>
            </div>
          </form>
        )}
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
