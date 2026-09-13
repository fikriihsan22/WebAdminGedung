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

export async function closeTestDatabase() {
  await db.close();
}
