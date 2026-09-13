"use server";

import { redirect } from "next/navigation";

import { destroyCurrentSession } from "@/lib/server/session";

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/login");
}
