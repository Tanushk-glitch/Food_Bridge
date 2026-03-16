"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MotionReveal } from "@/components/motion-reveal";
import { RoleCard } from "@/components/role-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { publicRoles, roleContent, type UserRole } from "@/lib/roles";

type SignupFormProps = {
  initialRole?: UserRole | null;
};

export function SignupForm({ initialRole = null }: SignupFormProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(initialRole);
  const [currentStep, setCurrentStep] = useState<"details" | "otp">("details");
  const [pendingData, setPendingData] = useState<Record<string, string> | null>(null);
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const stepBadge = useMemo(() => {
    if (!selectedRole) {
      return 1;
    }
    return currentStep === "details" ? 2 : 3;
  }, [currentStep, selectedRole]);

  async function handleRequestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      intent: "signup",
      role: formData.get("role"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      organizationName: formData.get("organizationName")
    };

    const response = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Unable to send OTP. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setDevCode(typeof data.devCode === "string" ? data.devCode : "");
    setPendingData(
      Object.fromEntries(
        Object.entries(payload).filter(([, value]) => typeof value === "string" && value)
      ) as Record<string, string>
    );
    setCurrentStep("otp");
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
        intent: "signup",
        role: pendingData?.role,
        email: pendingData?.email,
        otp
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Invalid OTP. Please try again.");
      setIsSubmitting(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center gap-3">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex items-center gap-3 rounded-full px-4 py-2 text-sm ${
              stepBadge >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-xs">{step}</span>
            {step === 1 ? "Role selection" : step === 2 ? "Account creation" : "Verify email"}
          </div>
        ))}
      </div>

      {!selectedRole ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {publicRoles.map((role, index) => (
            <MotionReveal key={role} delay={index * 0.08}>
              <RoleCard
                title={roleContent[role].label}
                description={roleContent[role].description}
                onClick={() => setSelectedRole(role)}
              />
            </MotionReveal>
          ))}
        </div>
      ) : (
        <MotionReveal>
          <Card>
            <CardHeader>
              <CardTitle>Create your {roleContent[selectedRole].shortLabel.toLowerCase()} account</CardTitle>
              <CardDescription>Minimal details to get you into the FoodBridge onboarding flow.</CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === "details" ? (
                <form onSubmit={handleRequestOtp} className="grid gap-4 sm:grid-cols-2">
                  <input type="hidden" name="role" value={selectedRole} />
                  <div className="sm:col-span-2">
                    <Button type="button" variant="ghost" className="px-0" onClick={() => setSelectedRole(null)}>
                      <ArrowLeft className="h-4 w-4" />
                      Change role
                    </Button>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Name</label>
                    <Input name="name" placeholder="Rishabh Sharma" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Email</label>
                    <Input name="email" type="email" placeholder="name@example.com" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Phone</label>
                    <Input name="phone" type="tel" placeholder="+91 98765 43210" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Password</label>
                    <Input name="password" type="password" placeholder="Create a secure password" required />
                  </div>
                  {(selectedRole === "donor" || selectedRole === "ngo") && (
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium">Organization Name</label>
                      <Input
                        name="organizationName"
                        placeholder={selectedRole === "ngo" ? "Asha Foundation" : "Green Fork Bistro"}
                      />
                    </div>
                  )}
                  {error && <p className="sm:col-span-2 text-sm font-medium text-destructive">{error}</p>}
                  <div className="sm:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link href="/login" className="font-medium text-primary">
                        Login
                      </Link>
                    </p>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="grid gap-4">
                  <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
                    <p className="font-semibold">We sent a 5-digit code to {pendingData?.email}.</p>
                    <p className="text-muted-foreground">Enter it below to verify your email and continue.</p>
                    {devCode && (
                      <p className="mt-2 font-semibold text-foreground">Dev OTP: {devCode}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Verification code</label>
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
                    <Button type="button" variant="ghost" onClick={() => setCurrentStep("details")}>
                      Edit details
                    </Button>
                    <Button type="submit" size="lg" disabled={isSubmitting || otp.length !== 5}>
                      {isSubmitting ? "Verifying..." : "Verify & continue"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </MotionReveal>
      )}
    </div>
  );
}
