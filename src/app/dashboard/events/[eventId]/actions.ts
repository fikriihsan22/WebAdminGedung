"use server";

import { redirect } from "next/navigation";

import { db } from "@/../prisma/db";
import { getPaymentStatus } from "@/lib/domain/payment";
import { requireBuildingAdmin } from "@/lib/server/auth";
import { cancelEventSchema, finalPaymentSchema } from "@/validation/event";

export type EventActionState = {
  error?: string;
};

export async function recordFinalPaymentAction(eventId: string, _: EventActionState, formData: FormData): Promise<EventActionState> {
  const eventIdResult = cancelEventSchema.safeParse({ eventId });
  const paymentResult = finalPaymentSchema.safeParse({ finalPayment: formData.get("finalPayment") });

  if (!eventIdResult.success || !paymentResult.success) {
    return { error: "Nominal pelunasan tidak valid." };
  }

  const user = await requireBuildingAdmin();
  const result = await db.transaction(async (tx) => {
    const event = await tx.orm.public.Event.where({ id: eventId, buildingId: user.buildingId }).first();

    if (!event) {
      return "NOT_FOUND" as const;
    }

    if (event.eventStatus !== "ACTIVE") {
      return "NOT_ACTIVE" as const;
    }

    await tx.orm.public.Event.where({ id: event.id, buildingId: user.buildingId, eventStatus: "ACTIVE" }).update({
      finalPayment: paymentResult.data.finalPayment,
      paymentStatus: getPaymentStatus({ ...event, finalPayment: paymentResult.data.finalPayment }),
    });

    return "UPDATED" as const;
  });

  if (result === "NOT_FOUND") {
    return { error: "Acara tidak ditemukan." };
  }

  if (result === "NOT_ACTIVE") {
    return { error: "Hanya acara aktif yang dapat menerima pelunasan." };
  }

  redirect(`/dashboard/events/${eventId}?settled=1`);
}

export async function cancelEventAction(eventId: string) {
  const eventIdResult = cancelEventSchema.safeParse({ eventId });

  if (!eventIdResult.success) {
    redirect("/dashboard");
  }

  const user = await requireBuildingAdmin();
  const result = await db.transaction(async (tx) => {
    const event = await tx.orm.public.Event.where({ id: eventId, buildingId: user.buildingId }).first();

    if (!event) {
      return "NOT_FOUND" as const;
    }

    if (event.eventStatus !== "ACTIVE") {
      return "NOT_ACTIVE" as const;
    }

    await tx.orm.public.Event.where({ id: event.id, buildingId: user.buildingId, eventStatus: "ACTIVE" }).update({
      eventStatus: "CANCELLED",
    });

    return "CANCELLED" as const;
  });

  if (result === "NOT_FOUND") {
    redirect("/dashboard");
  }

  redirect(`/dashboard/events/${eventId}?cancelled=${result === "NOT_ACTIVE" ? "not-active" : "1"}`);
}
