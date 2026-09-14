"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/../prisma/db";
import { requireCentralAdmin } from "@/lib/server/auth";

const businessTimeZone = "Asia/Jakarta";

function startOfTodayInBusinessTime() {
  const today = Temporal.Now.instant().toZonedDateTimeISO(businessTimeZone).toPlainDate().toString();
  return Temporal.ZonedDateTime.from(`${today}T00:00:00[${businessTimeZone}]`).toInstant();
}

export async function syncCompletedEventsAction() {
  await requireCentralAdmin();

  const cutoff = startOfTodayInBusinessTime();
  const updatedCount = await db.transaction(async (tx) => {
    const eligibleEvents = await tx.orm.public.Event
      .where({ eventStatus: "ACTIVE" })
      .where((event) => event.eventDate.lt(cutoff))
      .all();

    await Promise.all(
      eligibleEvents.map((event) =>
        tx.orm.public.Event.where({ id: event.id, eventStatus: "ACTIVE" }).update({ eventStatus: "COMPLETED" }),
      ),
    );

    return eligibleEvents.length;
  });

  revalidatePath("/central");
  revalidatePath("/dashboard");

  return { updatedCount };
}
