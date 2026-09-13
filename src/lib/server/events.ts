import "server-only";

import { notFound, redirect } from "next/navigation";

import { db } from "@/../prisma/db";
import { requireRole } from "@/lib/server/auth";

async function getBuildingAdminContext() {
  const user = await requireRole("BUILDING_ADMIN");

  if (!user.buildingId) {
    redirect("/login");
  }

  return { user, buildingId: user.buildingId };
}

export async function listBuildingEvents() {
  const { buildingId } = await getBuildingAdminContext();
  const events = await db.orm.public.Event.where({ buildingId }).all();

  return events.sort((first, second) => first.eventDate.epochMilliseconds - second.eventDate.epochMilliseconds);
}

export async function getBuildingEvent(eventId: string) {
  const { buildingId } = await getBuildingAdminContext();
  const event = await db.orm.public.Event.where({ id: eventId, buildingId }).first();

  if (!event) {
    notFound();
  }

  return event;
}
