import { db } from "../prisma/db";

const testClientPrefix = "E2E Test ";

function assertTestDatabaseAccess() {
  if (process.env.E2E_ALLOW_DATABASE !== "1") {
    throw new Error("E2E_ALLOW_DATABASE=1 wajib disetel sebelum test E2E mengakses database.");
  }
}

export async function cleanupTestEvents() {
  assertTestDatabaseAccess();

  const events = await db.orm.public.Event.all();
  const testEvents = events.filter((event) => event.clientName.startsWith(testClientPrefix));

  await Promise.all(testEvents.map((event) => db.orm.public.Event.where({ id: event.id }).delete()));
}

export async function createTestCalendarEvent({
  clientName,
  eventDate,
  eventStatus,
  paymentStatus,
}: {
  clientName: string;
  eventDate: Temporal.Instant;
  eventStatus: "ACTIVE" | "COMPLETED" | "CANCELLED";
  paymentStatus: "UNPAID" | "DP_PAID" | "PAID";
}) {
  assertTestDatabaseAccess();

  const payments = paymentStatus === "UNPAID"
    ? { downPayment: 0, finalPayment: 0 }
    : paymentStatus === "DP_PAID"
      ? { downPayment: 25000, finalPayment: 0 }
      : { downPayment: 100000, finalPayment: 0 };

  await db.orm.public.Event.create({
    id: crypto.randomUUID(),
    buildingId: "building-alpha",
    clientName: `${testClientPrefix}${clientName}`,
    eventDate,
    session: "DAY",
    totalAmount: 100000,
    ...payments,
    paymentStatus,
    eventStatus,
    createdById: "user-alpha-admin",
    cancelReason: eventStatus === "CANCELLED" ? "Fixture test calendar" : null,
  });
}

export async function closeTestDatabase() {
  await db.close();
}
