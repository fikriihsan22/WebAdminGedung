import "server-only";

import { db } from "@/../prisma/db";
import { requireCentralAdminCapability } from "@/lib/server/auth";
import type { CentralDashboardFilters } from "@/validation/dashboard";

const eventsPerPage = 20;
const buildingsPerPage = 12;

function dateStart(value: string) {
  return Temporal.ZonedDateTime.from(`${value}T00:00:00[Asia/Jakarta]`).toInstant();
}

function dateEnd(value: string) {
  return Temporal.ZonedDateTime.from(`${value}T23:59:59.999[Asia/Jakarta]`).toInstant();
}

function currentYearRange() {
  const year = Temporal.Now.instant().toZonedDateTimeISO("Asia/Jakarta").year;
  return { year, startDate: `${year}-01-01`, endDate: `${year}-12-31` };
}

export async function getCentralDashboard(filters: CentralDashboardFilters) {
  await requireCentralAdminCapability("VIEW_CROSS_BUILDING_EVENTS");

  const usesDefaultYear = !filters.startDate && !filters.endDate;
  const defaultYear = currentYearRange();
  const effectiveFilters = usesDefaultYear
    ? { ...filters, startDate: defaultYear.startDate, endDate: defaultYear.endDate }
    : filters;

  let eventsQuery = db.orm.public.Event;

  if (effectiveFilters.buildingId) eventsQuery = eventsQuery.where({ buildingId: effectiveFilters.buildingId });
  if (effectiveFilters.session) eventsQuery = eventsQuery.where({ session: effectiveFilters.session });
  if (effectiveFilters.eventStatus) eventsQuery = eventsQuery.where({ eventStatus: effectiveFilters.eventStatus });
  if (effectiveFilters.paymentStatus) eventsQuery = eventsQuery.where({ paymentStatus: effectiveFilters.paymentStatus });
  if (effectiveFilters.startDate) eventsQuery = eventsQuery.where((event) => event.eventDate.gte(dateStart(effectiveFilters.startDate!)));
  if (effectiveFilters.endDate) eventsQuery = eventsQuery.where((event) => event.eventDate.lte(dateEnd(effectiveFilters.endDate!)));

  const [events, buildings, spaces] = await Promise.all([
    eventsQuery.orderBy((event) => event.eventDate.asc()).all(),
    db.orm.public.Building.orderBy((building) => building.name.asc()).all(),
    db.orm.public.BookingSpace.all(),
  ]);

  const summary = events.reduce(
    (total, event) => ({
      totalEvents: total.totalEvents + 1,
      activeEvents: total.activeEvents + (event.eventStatus === "ACTIVE" ? 1 : 0),
      completedEvents: total.completedEvents + (event.eventStatus === "COMPLETED" ? 1 : 0),
      cancelledEvents: total.cancelledEvents + (event.eventStatus === "CANCELLED" ? 1 : 0),
    }),
    { totalEvents: 0, activeEvents: 0, completedEvents: 0, cancelledEvents: 0 },
  );

  const summaryBuildings = filters.buildingId ? buildings.filter((building) => building.id === filters.buildingId) : buildings;
  const buildingSummary = summaryBuildings.map((building) => {
    const buildingEvents = events.filter((event) => event.buildingId === building.id);
    return {
      id: building.id,
      name: building.name,
      totalEvents: buildingEvents.length,
      activeEvents: buildingEvents.filter((event) => event.eventStatus === "ACTIVE").length,
      completedEvents: buildingEvents.filter((event) => event.eventStatus === "COMPLETED").length,
      cancelledEvents: buildingEvents.filter((event) => event.eventStatus === "CANCELLED").length,
    };
  });

  const totalPages = Math.max(1, Math.ceil(events.length / eventsPerPage));
  const page = Math.min(filters.page, totalPages);
  const pageStart = (page - 1) * eventsPerPage;
  const pageEvents = events.slice(pageStart, pageStart + eventsPerPage).map((event) => ({ ...event, spaceName: spaces.find((space) => space.id === event.spaceId)?.name ?? "Ruang tidak ditemukan" }));
  const visibleBuildingCount = filters.buildingPage * buildingsPerPage;
  const visibleBuildingSummary = buildingSummary.slice(0, visibleBuildingCount);

  return {
    events: pageEvents,
    buildings,
    summary,
    buildingSummary: visibleBuildingSummary,
    defaultYear: usesDefaultYear ? defaultYear.year : null,
    pagination: {
      page,
      totalPages,
      totalEvents: events.length,
      from: events.length === 0 ? 0 : pageStart + 1,
      to: Math.min(pageStart + eventsPerPage, events.length),
    },
    hasMoreBuildings: visibleBuildingCount < buildingSummary.length,
  };
}
