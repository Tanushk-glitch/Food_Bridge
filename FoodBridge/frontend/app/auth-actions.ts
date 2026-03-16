"use server";

import { redirect } from "next/navigation";

import { clearSession, getDashboardPath, getSession, setSession } from "@/lib/auth";

export async function onboardingAction(formData: FormData) {
  const session = getSession();

  if (!session) {
    redirect("/login");
  }

  const updatedProfile: Record<string, string> = {};

  formData.forEach((value, key) => {
    if (key !== "role") {
      updatedProfile[key] = value instanceof File ? value.name : String(value);
    }
  });

  setSession({
    ...session,
    onboardingCompleted: true,
    profile: {
      ...session.profile,
      ...updatedProfile
    }
  });

  redirect(getDashboardPath(session.role));
}

export async function logoutAction() {
  clearSession();
  redirect("/");
}
