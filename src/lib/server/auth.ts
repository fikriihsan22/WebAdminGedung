import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser, type AuthenticatedUser } from "@/lib/server/session";

const centralAdminCapabilities = new Set([
  "VIEW_CROSS_BUILDING_EVENTS",
  "SYNC_PAST_EVENTS",
  "MANAGE_BUILDINGS",
  "MANAGE_BOOKING_SPACES",
  "MANAGE_BUILDING_ADMINS",
] as const);

export type CentralAdminCapability = typeof centralAdminCapabilities extends Set<infer Capability> ? Capability : never;

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

export async function requireBuildingAdmin() {
  const user = await requireRole("BUILDING_ADMIN");

  if (!user.buildingId) {
    redirect("/login");
  }

  return { ...user, buildingId: user.buildingId };
}

export async function requireCentralAdmin() {
  return requireRole("CENTRAL_ADMIN");
}

/**
 * Central Admin controls master data, but never receives a broad event-write
 * permission. Event lifecycle access is limited to the explicit completion
 * synchronization capability used by the existing dashboard automation.
 */
export async function requireCentralAdminCapability(capability: CentralAdminCapability) {
  const user = await requireCentralAdmin();

  if (!centralAdminCapabilities.has(capability)) {
    redirect(getDefaultRoute(user.role));
  }

  return user;
}
