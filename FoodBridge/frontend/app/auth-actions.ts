"use server";

import { redirect } from "next/navigation";

import { clearSession, getDashboardPath, getSession, isUserRole, setSession, type UserRole } from "@/lib/auth";

function readRequired(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readRole(formData: FormData, key = "role"): UserRole {
  const value = String(formData.get(key) ?? "");

  if (!isUserRole(value)) {
    throw new Error(`Invalid role: ${value}`);
  }

  return value;
}

export async function signupAction(formData: FormData) {
  const role = readRole(formData);
  const name = readRequired(formData, "name");
  const email = readRequired(formData, "email");
  const phone = readRequired(formData, "phone");
  const password = readRequired(formData, "password");
  const organizationName = readRequired(formData, "organizationName");

  setSession({
    role,
    name,
    email,
    phone,
    password,
    organizationName: organizationName || undefined,
    onboardingCompleted: false,
    profile: {}
  });

  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  const requestedRole = String(formData.get("role") ?? "");
  const email = readRequired(formData, "email");
  const password = readRequired(formData, "password");

  let role: UserRole = isUserRole(requestedRole) ? requestedRole : "donor";
  const emailLower = email.toLowerCase();

  if (emailLower.includes("admin")) {
    role = "admin";
  }

  setSession({
    role,
    name: emailLower.includes("admin") ? "FoodBridge Admin" : email.split("@")[0],
    email,
    phone: "+91 90000 00000",
    password,
    organizationName: role === "admin" ? "FoodBridge Ops" : undefined,
    onboardingCompleted: true,
    profile: {}
  });

  redirect(getDashboardPath(role));
}

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
