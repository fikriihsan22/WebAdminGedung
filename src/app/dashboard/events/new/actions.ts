"use server";

import { redirect } from "next/navigation";

import { db } from "@/../prisma/db";
import { getPaymentStatus } from "@/lib/domain/payment";
import { requireBuildingAdmin } from "@/lib/server/auth";
import { eventFormData, eventFormSchema } from "@/validation/event";

export type CreateEventActionState = {
  error?: string;
};

export async function createEventAction(_: CreateEventActionState, formData: FormData): Promise<CreateEventActionState> {
  const parsed = eventFormSchema.safeParse(eventFormData(formData));

  if (!parsed.success) {
    return { error: "Periksa kembali data acara yang diisi." };
  }

  const user = await requireBuildingAdmin();
  const input = parsed.data;
  const eventDate = Temporal.Instant.from(`${input.eventDate}T00:00:00.000Z`);

  const event = await db.transaction(async (tx) => {
    const conflictingEvent = await tx.orm.public.Event.where({
      buildingId: user.buildingId,
      eventDate,
      session: input.session,
      eventStatus: "ACTIVE",
    }).first();

    if (conflictingEvent) {
      return null;
    }

    return tx.orm.public.Event.create({
      buildingId: user.buildingId,
      clientName: input.clientName,
      eventDate,
      session: input.session,
      totalAmount: input.totalAmount,
      downPayment: input.downPayment,
      finalPayment: input.finalPayment,
      paymentStatus: getPaymentStatus(input),
      eventStatus: "ACTIVE",
      createdById: user.id,
      cancelReason: null,
    });
  });

  if (!event) {
    return { error: "Sesi pada tanggal tersebut sudah digunakan. Pilih sesi atau tanggal lain." };
  }

  redirect(`/dashboard/events/${event.id}?created=1`);
}
