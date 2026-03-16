import { getSession } from "@/lib/auth";

export function requireAdminSession() {
  const session = getSession();
  if (!session || session.dbRole !== "ADMIN") {
    return null;
  }
  return session;
}

