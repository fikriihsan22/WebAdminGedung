"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

import { db } from "@/../prisma/db";
import { getDefaultRoute } from "@/lib/server/auth";
import { createSession, setSessionCookie } from "@/lib/server/session";
import { loginSchema } from "@/validation/auth";

export type LoginActionState = {
  error?: string;
};

const invalidCredentials: LoginActionState = {
  error: "Username atau PIN tidak valid.",
};

export async function loginAction(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    pin: formData.get("pin"),
  });

  if (!parsed.success) {
    return invalidCredentials;
  }

  const user = await db.orm.public.User.where({ username: parsed.data.username }).first();

  if (!user || !user.isActive || !(await bcrypt.compare(parsed.data.pin, user.pinHash))) {
    return invalidCredentials;
  }

  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);
  redirect(getDefaultRoute(user.role));
}
