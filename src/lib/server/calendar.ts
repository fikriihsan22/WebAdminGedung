import "server-only";

import { db } from "@/../prisma/db";
import { requireBuildingAdmin, requireCentralAdminCapability } from "@/lib/server/auth";
import type { CalendarFilters } from "@/validation/calendar";

const businessTimeZone = "Asia/Jakarta";

function monthRange(month: string) {
  const nextMonth = Temporal.PlainYearMonth.from(month).add({ months: 1 }).toString();

  return {
    end: Temporal.ZonedDateTime.from(`${nextMonth}-01T00:00:00[${businessTimeZone}]`).toInstant(),
    start: Temporal.ZonedDateTime.from(`${month}-01T00:00:00[${businessTimeZone}]`).toInstant(),
  };
}

async function listCalendarEvents(buildingId: string, month: string) {
  const { start, end } = monthRange(month);
  let eventsQuery = db.orm.public.Event.where({ buildingId });

  eventsQuery = eventsQuery.where((event) => event.eventDate.gte(start));
  eventsQuery = eventsQuery.where((event) => event.eventDate.lt(end));

  const [events, spaces] = await Promise.all([eventsQuery.orderBy((event) => event.eventDate.asc()).all(), db.orm.public.BookingSpace.where({ buildingId }).all()]);
  return events.filter((event) => event.eventStatus !== "CANCELLED" && event.paymentStatus !== "UNPAID").map((event) => ({ ...event, spaceName: spaces.find((space) => space.id === event.spaceId)?.name ?? "Ruang tidak ditemukan" }));
}

export async function getBuildingCalendar(filters: CalendarFilters) {
  const { buildingId } = await requireBuildingAdmin();

  return {
    events: await listCalendarEvents(buildingId, filters.month),
    month: filters.month,
  };
}

export async function getCentralCalendar(filters: CalendarFilters) {
  await requireCentralAdminCapability("VIEW_CROSS_BUILDING_EVENTS");

  const buildings = await db.orm.public.Building.orderBy((building) => building.name.asc()).all();
  const selectedBuilding = buildings.find((building) => building.id === filters.buildingId) ?? buildings[0] ?? null;

  return {
    buildings: buildings.map((building) => ({ id: building.id, name: building.name })),
    events: selectedBuilding ? await listCalendarEvents(selectedBuilding.id, filters.month) : [],
    month: filters.month,
    selectedBuilding: selectedBuilding ? { id: selectedBuilding.id, name: selectedBuilding.name } : null,
  };
}
