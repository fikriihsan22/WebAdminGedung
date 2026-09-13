import { AppShell } from "@/components/app-shell";
import { db } from "@/../prisma/db";
import { requireRole } from "@/lib/server/auth";

export default async function BuildingDashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireRole("BUILDING_ADMIN");
  const building = user.buildingId ? await db.orm.public.Building.where({ id: user.buildingId }).first() : null;

  return <AppShell user={{ ...user, buildingName: building?.name }}>{children}</AppShell>;
}
