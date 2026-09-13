"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

import { db } from "@/../prisma/db";
import { getDefaultRoute } from "@/lib/server/auth";
import { clearLoginAttempts, isLoginRateLimited, recordLoginFailure } from "@/lib/server/login-rate-limit";
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

  if (isLoginRateLimited(parsed.data.username)) {
    return { error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." };
  }

  const user = await db.orm.public.User.where({ username: parsed.data.username }).first();

  if (!user || !user.isActive || !(await bcrypt.compare(parsed.data.pin, user.pinHash))) {
    recordLoginFailure(parsed.data.username);
    return invalidCredentials;
  }

  clearLoginAttempts(parsed.data.username);
  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);
  redirect(getDefaultRoute(user.role));
}
