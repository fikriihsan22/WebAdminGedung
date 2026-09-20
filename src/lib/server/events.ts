import "server-only";

import { notFound } from "next/navigation";

import { db } from "@/../prisma/db";
import { requireBuildingAdmin } from "@/lib/server/auth";

export async function listBuildingEvents() {
  const { buildingId } = await requireBuildingAdmin();
  const [events, spaces] = await Promise.all([db.orm.public.Event.where({ buildingId }).all(), db.orm.public.BookingSpace.where({ buildingId }).all()]);

  return events.map((event) => ({ ...event, spaceName: spaces.find((space) => space.id === event.spaceId)?.name ?? "Ruang tidak ditemukan" })).sort((first, second) => first.eventDate.epochMilliseconds - second.eventDate.epochMilliseconds);
}

export async function getBuildingEvent(eventId: string) {
  const { buildingId } = await requireBuildingAdmin();
  const event = await db.orm.public.Event.where({ id: eventId, buildingId }).first();

  if (!event) {
    notFound();
  }

  const space = await db.orm.public.BookingSpace.where({ id: event.spaceId, buildingId }).first();
  return { ...event, spaceName: space?.name ?? "Ruang tidak ditemukan" };
}
