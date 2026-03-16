export type UserRole = "donor" | "ngo" | "delivery" | "admin";

const ADMIN_EMAILS = new Set(["admin@gmail.com"]);

function demoAdminPatternEnabled() {
  const value = process.env.NEXT_PUBLIC_DEMO_ADMIN_BYPASS || process.env.DEMO_ADMIN_BYPASS;
  return String(value || "").trim().toLowerCase() === "true";
}

export const roleContent = {
  donor: {
    label: "Restaurant / Individual Donor",
    shortLabel: "Donor",
    description: "Donate surplus food",
    dashboardPath: "/dashboard/donor"
  },
  ngo: {
    label: "NGO / Volunteer",
    shortLabel: "NGO",
    description: "Accept food donations and distribute to people",
    dashboardPath: "/dashboard/ngo"
  },
  delivery: {
    label: "Delivery Partner",
    shortLabel: "Delivery",
    description: "Pick up and transport food",
    dashboardPath: "/dashboard/delivery"
  },
  admin: {
    label: "Admin",
    shortLabel: "Admin",
    description: "Restricted monitoring and operations access",
    dashboardPath: "/dashboard/admin"
  }
} satisfies Record<UserRole, { label: string; shortLabel: string; description: string; dashboardPath: string }>;

export const publicRoles: UserRole[] = ["donor", "ngo", "delivery"];

export function isUserRole(value: string | null | undefined): value is UserRole {
  return value === "donor" || value === "ngo" || value === "delivery" || value === "admin";
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  const normalized = email.trim().toLowerCase();

  if (ADMIN_EMAILS.has(normalized)) {
    return true;
  }

  if (demoAdminPatternEnabled()) {
    return normalized.includes("admin");
  }

  return false;
}

export function getDashboardPath(role: UserRole) {
  return roleContent[role].dashboardPath;
}

export function getRoleLabel(role: UserRole) {
  return roleContent[role].label;
}
