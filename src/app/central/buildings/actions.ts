"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

import { db } from "@/../prisma/db";
import { requireCentralAdminCapability } from "@/lib/server/auth";
import {
  assignBuildingAdminSchema, bookingSpaceStatusSchema, buildingAdminStatusSchema, buildingStatusSchema,
  createBookingSpaceSchema, createBuildingAdminSchema, createBuildingSchema, updateBookingSpaceSchema, updateBuildingSchema,
} from "@/validation/building";

function invalidInput(): never { throw new Error("Data pengaturan gedung tidak valid."); }
function refreshBuildings() { revalidatePath("/central"); revalidatePath("/central/buildings"); }

export async function createBuildingAction(value: unknown) {
  const input = createBuildingSchema.safeParse(value); if (!input.success) invalidInput(); const data = input.data;
  await requireCentralAdminCapability("MANAGE_BUILDINGS");
  const building = await db.transaction(async (tx) => {
    const created = await tx.orm.public.Building.create({ name: data.name, isActive: true });
    await Promise.all(data.spaces.map((name, sortOrder) => tx.orm.public.BookingSpace.create({ buildingId: created.id, name, sortOrder, isActive: true })));
    return created;
  });
  refreshBuildings(); return { buildingId: building.id };
}

export async function updateBuildingAction(value: unknown) {
  const input = updateBuildingSchema.safeParse(value); if (!input.success) invalidInput(); const data = input.data;
  await requireCentralAdminCapability("MANAGE_BUILDINGS");
  await db.orm.public.Building.where({ id: data.buildingId }).update({ name: data.name }); refreshBuildings();
}

export async function setBuildingActiveAction(value: unknown) {
  const input = buildingStatusSchema.safeParse(value); if (!input.success) invalidInput(); const data = input.data;
  await requireCentralAdminCapability("MANAGE_BUILDINGS");
  await db.orm.public.Building.where({ id: data.buildingId }).update({ isActive: data.isActive }); refreshBuildings();
}

export async function createBookingSpaceAction(value: unknown) {
  const input = createBookingSpaceSchema.safeParse(value); if (!input.success) invalidInput(); const data = input.data;
  await requireCentralAdminCapability("MANAGE_BOOKING_SPACES");
  const building = await db.orm.public.Building.where({ id: data.buildingId, isActive: true }).first(); if (!building) throw new Error("Gedung aktif tidak ditemukan.");
  const spaces = await db.orm.public.BookingSpace.where({ buildingId: building.id }).all();
  await db.orm.public.BookingSpace.create({ buildingId: building.id, name: data.name, sortOrder: spaces.length, isActive: true }); refreshBuildings();
}

export async function updateBookingSpaceAction(value: unknown) {
  const input = updateBookingSpaceSchema.safeParse(value); if (!input.success) invalidInput(); const data = input.data;
  await requireCentralAdminCapability("MANAGE_BOOKING_SPACES");
  await db.orm.public.BookingSpace.where({ id: data.spaceId }).update({ name: data.name }); refreshBuildings();
}

export async function setBookingSpaceActiveAction(value: unknown) {
  const input = bookingSpaceStatusSchema.safeParse(value); if (!input.success) invalidInput(); const data = input.data;
  await requireCentralAdminCapability("MANAGE_BOOKING_SPACES");
  if (!data.isActive) {
    const today = Temporal.Now.instant().toZonedDateTimeISO("Asia/Jakarta").startOfDay().toInstant();
    const activeEvent = await db.orm.public.Event.where({ spaceId: data.spaceId, eventStatus: "ACTIVE" }).where((event) => event.eventDate.gte(today)).first();
    if (activeEvent) throw new Error("Ruang masih memiliki acara aktif mendatang.");
  }
  await db.orm.public.BookingSpace.where({ id: data.spaceId }).update({ isActive: data.isActive }); refreshBuildings();
}

export async function createBuildingAdminAction(value: unknown) {
  const input = createBuildingAdminSchema.safeParse(value); if (!input.success) invalidInput(); const data = input.data;
  await requireCentralAdminCapability("MANAGE_BUILDING_ADMINS");
  const building = await db.orm.public.Building.where({ id: data.buildingId, isActive: true }).first(); if (!building) throw new Error("Gedung aktif tidak ditemukan.");
  await db.orm.public.User.create({ name: data.name, username: data.username, pinHash: bcrypt.hashSync(data.pin, 12), role: "BUILDING_ADMIN", buildingId: building.id, isActive: true }); refreshBuildings();
}

export async function assignBuildingAdminAction(value: unknown) {
  const input = assignBuildingAdminSchema.safeParse(value); if (!input.success) invalidInput(); const data = input.data;
  await requireCentralAdminCapability("MANAGE_BUILDING_ADMINS");
  const [user, building] = await Promise.all([db.orm.public.User.where({ id: data.userId, role: "BUILDING_ADMIN" }).first(), db.orm.public.Building.where({ id: data.buildingId, isActive: true }).first()]);
  if (!user || !building) throw new Error("Admin gedung atau gedung aktif tidak ditemukan.");
  await db.orm.public.User.where({ id: user.id }).update({ buildingId: building.id }); refreshBuildings();
}

export async function setBuildingAdminActiveAction(value: unknown) {
  const input = buildingAdminStatusSchema.safeParse(value); if (!input.success) invalidInput(); const data = input.data;
  await requireCentralAdminCapability("MANAGE_BUILDING_ADMINS");
  const user = await db.orm.public.User.where({ id: data.userId, role: "BUILDING_ADMIN" }).first(); if (!user) throw new Error("Admin gedung tidak ditemukan.");
  await db.orm.public.User.where({ id: user.id }).update({ isActive: data.isActive }); refreshBuildings();
}
