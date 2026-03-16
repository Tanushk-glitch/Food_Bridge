export type UserRole = "donor" | "ngo" | "delivery" | "admin";

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
    dashboardPath: "/admin"
  }
} satisfies Record<UserRole, { label: string; shortLabel: string; description: string; dashboardPath: string }>;

export const publicRoles: UserRole[] = ["donor", "ngo", "delivery"];

export function isUserRole(value: string | null | undefined): value is UserRole {
  return value === "donor" || value === "ngo" || value === "delivery" || value === "admin";
}

export function getDashboardPath(role: UserRole) {
  return roleContent[role].dashboardPath;
}

export function getRoleLabel(role: UserRole) {
  return roleContent[role].label;
}
