import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import { db } from "@/../prisma/db";

const SESSION_COOKIE_NAME = "admin_gedung_session";
const SESSION_DURATION_DAYS = 30;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export type AuthenticatedUser = {
  id: string;
  name: string;
  username: string;
  role: "CENTRAL_ADMIN" | "BUILDING_ADMIN";
  buildingId: string | null;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getSessionExpiry() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now() + SESSION_DURATION_MS);
}

function toAuthenticatedUser(user: {
  id: string;
  name: string;
  username: string;
  role: "CENTRAL_ADMIN" | "BUILDING_ADMIN";
  buildingId: string | null;
}): AuthenticatedUser {
  return user;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = getSessionExpiry();

  await db.orm.public.Session.create({
    tokenHash: hashSessionToken(token),
    userId,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Temporal.Instant) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt.epochMilliseconds),
  });
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await db.orm.public.Session.where({ tokenHash: hashSessionToken(token) }).first();

  if (!session || Temporal.Instant.compare(session.expiresAt, Temporal.Now.instant()) <= 0) {
    return null;
  }

  const user = await db.orm.public.User.where({ id: session.userId }).first();

  if (!user || !user.isActive) {
    return null;
  }

  return toAuthenticatedUser(user);
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.orm.public.Session.where({ tokenHash: hashSessionToken(token) }).delete();
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
