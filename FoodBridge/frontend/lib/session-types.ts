import type { UserRole } from "@/lib/roles";

export type DemoSession = {
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  organizationName?: string;
  onboardingCompleted: boolean;
  profile: Record<string, string>;
};
