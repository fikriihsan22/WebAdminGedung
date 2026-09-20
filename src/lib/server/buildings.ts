import "server-only";

import { db } from "@/../prisma/db";
import { requireCentralAdminCapability } from "@/lib/server/auth";

export async function listCentralBuildings() {
  await requireCentralAdminCapability("MANAGE_BUILDINGS");
  const [buildings, spaces, users] = await Promise.all([
    db.orm.public.Building.orderBy((building) => building.name.asc()).all(),
    db.orm.public.BookingSpace.orderBy((space) => space.sortOrder.asc()).all(),
    db.orm.public.User.where({ role: "BUILDING_ADMIN" }).all(),
  ]);
  return buildings.map((building) => ({
    ...building,
    spaces: spaces.filter((space) => space.buildingId === building.id),
    admins: users.filter((user) => user.buildingId === building.id),
  }));
}

export async function getCentralBuilding(buildingId: string) {
  await requireCentralAdminCapability("MANAGE_BUILDINGS");
  const buildings = await listCentralBuildings();
  return buildings.find((building) => building.id === buildingId) ?? null;
}

export async function listActiveBookingSpaces(buildingId: string) {
  return db.orm.public.BookingSpace
    .where({ buildingId, isActive: true })
    .orderBy((space) => space.sortOrder.asc())
    .all();
}
