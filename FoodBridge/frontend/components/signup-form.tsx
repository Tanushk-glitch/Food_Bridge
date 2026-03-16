"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { signupAction } from "@/app/auth-actions";
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

  const currentStep = useMemo(() => (selectedRole ? 2 : 1), [selectedRole]);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center gap-3">
        {[1, 2].map((step) => (
          <div
            key={step}
            className={`flex items-center gap-3 rounded-full px-4 py-2 text-sm ${
              currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-xs">{step}</span>
            {step === 1 ? "Role selection" : "Account creation"}
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
              <form action={signupAction} className="grid gap-4 sm:grid-cols-2">
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
                    <Input name="organizationName" placeholder={selectedRole === "ngo" ? "Asha Foundation" : "Green Fork Bistro"} />
                  </div>
                )}
                <div className="sm:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary">
                      Login
                    </Link>
                  </p>
                  <Button type="submit" size="lg">
                    Continue to onboarding
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </MotionReveal>
      )}
    </div>
  );
}
