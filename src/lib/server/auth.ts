import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser, type AuthenticatedUser } from "@/lib/server/session";

export function getDefaultRoute(role: AuthenticatedUser["role"]) {
  return role === "CENTRAL_ADMIN" ? "/central" : "/dashboard";
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(...roles: AuthenticatedUser["role"][]) {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    redirect(getDefaultRoute(user.role));
  }

  return user;
}

export async function requireBuildingAccess(buildingId: string) {
  const user = await requireUser();

  if (user.role === "BUILDING_ADMIN" && user.buildingId !== buildingId) {
    redirect("/dashboard");
  }

  return user;
}
