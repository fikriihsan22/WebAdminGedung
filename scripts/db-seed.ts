import bcrypt from "bcrypt";
import "temporal-polyfill/types/global";

import { db } from "../prisma/db.ts";

const buildings = [
  { id: "building-alpha", name: "Gedung Alpha" },
  { id: "building-beta", name: "Gedung Beta" },
];

const bookingSpaces = [
  { id: "building-alpha", buildingId: "building-alpha", name: "Gedung Utama", sortOrder: 0 },
  { id: "building-beta", buildingId: "building-beta", name: "Gedung Utama", sortOrder: 0 },
];

const users = [
  {
    id: "user-central-admin",
    name: "Admin Pusat",
    username: "admin.pusat",
    pin: "123456",
    role: "CENTRAL_ADMIN" as const,
    buildingId: null,
  },
  {
    id: "user-alpha-admin",
    name: "Admin Gedung Alpha",
    username: "admin.alpha",
    pin: "123456",
    role: "BUILDING_ADMIN" as const,
    buildingId: "building-alpha",
  },
  {
    id: "user-beta-admin",
    name: "Admin Gedung Beta",
    username: "admin.beta",
    pin: "123456",
    role: "BUILDING_ADMIN" as const,
    buildingId: "building-beta",
  },
];

async function main() {
  const pinHashes = new Map(users.map((user) => [user.id, bcrypt.hashSync(user.pin, 12)]));

  await db.transaction(async (tx) => {
    for (const building of buildings) {
      const existing = await tx.orm.public.Building.where({ id: building.id }).first();

      if (existing) {
        await tx.orm.public.Building.where({ id: building.id }).update({ name: building.name, isActive: true });
      } else {
        await tx.orm.public.Building.create({ ...building, isActive: true });
      }
    }

    for (const space of bookingSpaces) {
      const existing = await tx.orm.public.BookingSpace.where({ id: space.id }).first();
      if (existing) {
        await tx.orm.public.BookingSpace.where({ id: space.id }).update({ name: space.name, sortOrder: space.sortOrder, isActive: true });
      } else {
        await tx.orm.public.BookingSpace.create({ ...space, isActive: true });
      }
    }

    for (const user of users) {
      const existing = await tx.orm.public.User.where({ id: user.id }).first();
      const values = {
        name: user.name,
        username: user.username,
        pinHash: pinHashes.get(user.id)!,
        role: user.role,
        buildingId: user.buildingId,
        isActive: true,
      };

      if (existing) {
        await tx.orm.public.User.where({ id: user.id }).update(values);
      } else {
        await tx.orm.public.User.create({ id: user.id, ...values });
      }
    }

    const events = [
      {
        id: "event-alpha-day",
        buildingId: "building-alpha",
        spaceId: "building-alpha",
        clientName: "PT Nusantara",
        eventDate: Temporal.Instant.from("2026-09-20T00:00:00.000Z"),
        session: "DAY" as const,
        totalAmount: 10000000,
        downPayment: 3000000,
        finalPayment: 0,
        paymentStatus: "DP_PAID" as const,
        eventStatus: "ACTIVE" as const,
        createdById: "user-alpha-admin",
        cancelReason: null,
      },
      {
        id: "event-beta-night",
        buildingId: "building-beta",
        spaceId: "building-beta",
        clientName: "Komunitas Harmoni",
        eventDate: Temporal.Instant.from("2026-09-27T00:00:00.000Z"),
        session: "NIGHT" as const,
        totalAmount: 7500000,
        downPayment: 7500000,
        finalPayment: 0,
        paymentStatus: "PAID" as const,
        eventStatus: "ACTIVE" as const,
        createdById: "user-beta-admin",
        cancelReason: null,
      },
    ];

    for (const event of events) {
      const existing = await tx.orm.public.Event.where({ id: event.id }).first();

      if (existing) {
        await tx.orm.public.Event.where({ id: event.id }).update(event);
      } else {
        await tx.orm.public.Event.create(event);
      }
    }
  });

  console.log("Seed selesai: 2 gedung, 3 user, dan 2 event.");
  console.log("PIN development seluruh akun: 123456");
}

try {
  await main();
} finally {
  await db.close();
}
