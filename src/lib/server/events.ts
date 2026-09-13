import "server-only";

import { notFound } from "next/navigation";

import { db } from "@/../prisma/db";
import { requireBuildingAdmin } from "@/lib/server/auth";

export async function listBuildingEvents() {
  const { buildingId } = await requireBuildingAdmin();
  const events = await db.orm.public.Event.where({ buildingId }).all();

  return events.sort((first, second) => first.eventDate.epochMilliseconds - second.eventDate.epochMilliseconds);
}

export async function getBuildingEvent(eventId: string) {
  const { buildingId } = await requireBuildingAdmin();
  const event = await db.orm.public.Event.where({ id: eventId, buildingId }).first();

  if (!event) {
    notFound();
  }

  return event;
}
