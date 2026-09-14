import "server-only";

import { db } from "@/../prisma/db";
import { requireCentralAdmin } from "@/lib/server/auth";
import type { CentralDashboardFilters } from "@/validation/dashboard";

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
  await requireCentralAdmin();

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

  const [events, buildings] = await Promise.all([
    eventsQuery.orderBy((event) => event.eventDate.asc()).all(),
    db.orm.public.Building.orderBy((building) => building.name.asc()).all(),
  ]);

  const summary = events.reduce(
    (total, event) => ({
      totalEvents: total.totalEvents + 1,
      activeEvents: total.activeEvents + (event.eventStatus === "ACTIVE" ? 1 : 0),
      completedEvents: total.completedEvents + (event.eventStatus === "COMPLETED" ? 1 : 0),
      cancelledEvents: total.cancelledEvents + (event.eventStatus === "CANCELLED" ? 1 : 0),
      totalDownPayment: total.totalDownPayment + event.downPayment,
      totalFinalPayment: total.totalFinalPayment + event.finalPayment,
    }),
    { totalEvents: 0, activeEvents: 0, completedEvents: 0, cancelledEvents: 0, totalDownPayment: 0, totalFinalPayment: 0 },
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

  return { events, buildings, summary, buildingSummary, defaultYear: usesDefaultYear ? defaultYear.year : null };
}
