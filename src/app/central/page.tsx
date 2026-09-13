import { LogoutButton } from "@/components/logout-button";
import { requireRole } from "@/lib/server/auth";

export default async function CentralDashboardPage() {
  const user = await requireRole("CENTRAL_ADMIN");

  return (
    <main className="min-h-screen bg-muted/40 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl rounded-xl border bg-background p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Dashboard Pusat</p>
            <h1 className="mt-2 text-2xl font-semibold">Selamat datang, {user.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Akses pusat bersifat read-only pada MVP ini.</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
