"use server";

import { redirect } from "next/navigation";

import { db } from "@/../prisma/db";
import { getPaymentStatus } from "@/lib/domain/payment";
import { requireBuildingAdmin } from "@/lib/server/auth";
import { eventFormData, eventFormSchema } from "@/validation/event";

export type CreateEventActionState = {
  error?: string;
};

function isUniqueViolation(error: unknown) {
  if (typeof error !== "object" || error === null) return false;

  const databaseError = error as { code?: unknown; sqlState?: unknown };
  return databaseError.code === "unique_violation" || databaseError.sqlState === "23505";
}

export async function createEventAction(_: CreateEventActionState, formData: FormData): Promise<CreateEventActionState> {
  const parsed = eventFormSchema.safeParse(eventFormData(formData));

  if (!parsed.success) {
    return { error: "Periksa kembali data acara yang diisi." };
  }

  const user = await requireBuildingAdmin();
  const input = parsed.data;
  const eventDate = Temporal.Instant.from(`${input.eventDate}T00:00:00.000Z`);

  try {
    const event = await db.transaction(async (tx) => {
      const building = await tx.orm.public.Building.where({ id: user.buildingId, isActive: true }).first();

      if (!building) {
        return "BUILDING_INACTIVE" as const;
      }

      const bookingSpaces = await tx.orm.public.BookingSpace.where({ buildingId: user.buildingId, isActive: true }).all();

      const bookingSpace = input.spaceId ? bookingSpaces.find((space) => space.id === input.spaceId) : bookingSpaces.length === 1 ? bookingSpaces[0] : undefined;
      if (!bookingSpace) {
        return "SPACE_SELECTION_REQUIRED" as const;
      }
      const conflictingEvent = await tx.orm.public.Event.where({
        buildingId: user.buildingId,
        spaceId: bookingSpace.id,
        eventDate,
        session: input.session,
        eventStatus: "ACTIVE",
      }).first();

      if (conflictingEvent) {
        return { kind: "CONFLICT" as const, spaceName: bookingSpace.name };
      }

      return tx.orm.public.Event.create({
        buildingId: user.buildingId,
        spaceId: bookingSpace.id,
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

    if (event === "BUILDING_INACTIVE") {
      return { error: "Gedung tidak aktif dan tidak dapat menerima acara baru." };
    }

    if (event === "SPACE_SELECTION_REQUIRED") {
      return { error: "Pilih ruang atau ballroom yang aktif terlebih dahulu." };
    }

    if (event && "kind" in event) {
      return { error: `${event.spaceName} sudah digunakan pada tanggal dan sesi yang dipilih.` };
    }

    redirect(`/dashboard/events/${event.id}?created=1`);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "Ruang atau ballroom tersebut baru saja digunakan pada tanggal dan sesi yang dipilih." };
    }

    throw error;
  }
}
