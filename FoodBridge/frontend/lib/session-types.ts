import type { UserRole } from "@/lib/roles";

export type DemoSession = {
  userId: string;
  dbRole: "ADMIN" | "DONOR" | "NGO" | "DELIVERY";
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  organizationName?: string;
  onboardingCompleted: boolean;
  profile: Record<string, string>;
};
