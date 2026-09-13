import { redirect } from "next/navigation";

import { getDefaultRoute } from "@/lib/server/auth";
import { getCurrentUser } from "@/lib/server/session";

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? getDefaultRoute(user.role) : "/login");
}
