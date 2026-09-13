import { redirect } from "next/navigation";

import { getDefaultRoute } from "@/lib/server/auth";
import { getCurrentUser } from "@/lib/server/session";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDefaultRoute(user.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-5 py-10">
      <section className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">Admin Management Gedung</p>
        <h1 className="mt-2 text-2xl font-semibold">Masuk</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Gunakan username dan PIN yang dibuat oleh admin.</p>
        <div className="mt-6"><LoginForm /></div>
      </section>
    </main>
  );
}
