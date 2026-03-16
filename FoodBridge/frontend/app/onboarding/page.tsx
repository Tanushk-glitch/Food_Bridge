import { redirect } from "next/navigation";

import { onboardingAction } from "@/app/auth-actions";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDashboardPath, getSession, roleContent } from "@/lib/auth";

function OnboardingFields({ role }: { role: "donor" | "ngo" | "delivery" }) {
  if (role === "donor") {
    return (
      <>
        <div>
          <label className="mb-2 block text-sm font-medium">Business / Individual name</label>
          <Input name="displayName" placeholder="Green Fork Bistro" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Location</label>
          <Input name="location" placeholder="Koramangala, Bengaluru" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Food donation type</label>
          <Input name="donationType" placeholder="Prepared meals, bakery, raw ingredients" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Operating hours</label>
          <Input name="operatingHours" placeholder="11:00 AM - 10:30 PM" required />
        </div>
      </>
    );
  }

  if (role === "ngo") {
    return (
      <>
        <div>
          <label className="mb-2 block text-sm font-medium">NGO name</label>
          <Input name="ngoName" placeholder="Asha Community Kitchen" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Service area</label>
          <Input name="serviceArea" placeholder="Koramangala, Ejipura, HSR" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Verification document upload</label>
          <Input name="verificationDocument" type="file" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Capacity (people served)</label>
          <Input name="capacity" placeholder="350 meals / day" required />
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium">Vehicle type</label>
        <Input name="vehicleType" placeholder="Bike, van, mini truck" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Service radius</label>
        <Input name="serviceRadius" placeholder="12 km" required />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-2 block text-sm font-medium">Availability</label>
        <Textarea name="availability" placeholder="Weekdays 6 PM - 11 PM, weekends flexible" required />
      </div>
    </>
  );
}

export default function OnboardingPage() {
  const session = getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.onboardingCompleted) {
    redirect(getDashboardPath(session.role));
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen radial-glow">
      <SiteHeader />
      <main className="container py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Step 3</p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Finish your {roleContent[session.role].shortLabel.toLowerCase()} onboarding
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              A few role-specific details help FoodBridge match donations, pickups, and community delivery faster.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{roleContent[session.role].label}</CardTitle>
              <CardDescription>Your account is created. Complete onboarding to unlock the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={onboardingAction} className="grid gap-4 sm:grid-cols-2">
                <OnboardingFields role={session.role} />
                <div className="sm:col-span-2 flex justify-end pt-2">
                  <Button type="submit" size="lg">
                    Complete onboarding
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
