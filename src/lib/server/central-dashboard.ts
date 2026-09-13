import "server-only";

import { db } from "@/../prisma/db";
import type { CentralDashboardFilters } from "@/validation/dashboard";

function dateStart(value: string) {
  return Temporal.Instant.from(`${value}T00:00:00.000Z`);
}

function dateEnd(value: string) {
  return Temporal.Instant.from(`${value}T23:59:59.999Z`);
}

export async function getCentralDashboard(filters: CentralDashboardFilters) {
  let eventsQuery = db.orm.public.Event;

  if (filters.buildingId) eventsQuery = eventsQuery.where({ buildingId: filters.buildingId });
  if (filters.session) eventsQuery = eventsQuery.where({ session: filters.session });
  if (filters.eventStatus) eventsQuery = eventsQuery.where({ eventStatus: filters.eventStatus });
  if (filters.paymentStatus) eventsQuery = eventsQuery.where({ paymentStatus: filters.paymentStatus });
  if (filters.startDate) eventsQuery = eventsQuery.where((event) => event.eventDate.gte(dateStart(filters.startDate!)));
  if (filters.endDate) eventsQuery = eventsQuery.where((event) => event.eventDate.lte(dateEnd(filters.endDate!)));

  const [events, buildings] = await Promise.all([
    eventsQuery.orderBy((event) => event.eventDate.asc()).all(),
    db.orm.public.Building.orderBy((building) => building.name.asc()).all(),
  ]);

  const summary = events.reduce(
    (total, event) => ({
      totalEvents: total.totalEvents + 1,
      activeEvents: total.activeEvents + (event.eventStatus === "ACTIVE" ? 1 : 0),
      cancelledEvents: total.cancelledEvents + (event.eventStatus === "CANCELLED" ? 1 : 0),
      totalDownPayment: total.totalDownPayment + event.downPayment,
      totalFinalPayment: total.totalFinalPayment + event.finalPayment,
    }),
    { totalEvents: 0, activeEvents: 0, cancelledEvents: 0, totalDownPayment: 0, totalFinalPayment: 0 },
  );

  const summaryBuildings = filters.buildingId ? buildings.filter((building) => building.id === filters.buildingId) : buildings;
  const buildingSummary = summaryBuildings.map((building) => {
    const buildingEvents = events.filter((event) => event.buildingId === building.id);
    return {
      id: building.id,
      name: building.name,
      totalEvents: buildingEvents.length,
      activeEvents: buildingEvents.filter((event) => event.eventStatus === "ACTIVE").length,
      cancelledEvents: buildingEvents.filter((event) => event.eventStatus === "CANCELLED").length,
    };
  });

  return { events, buildings, summary, buildingSummary };
}
