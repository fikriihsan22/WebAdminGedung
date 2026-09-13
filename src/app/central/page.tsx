import { EmptyState } from "@/components/states";
import { requireRole } from "@/lib/server/auth";

export default async function CentralDashboardPage() {
  const user = await requireRole("CENTRAL_ADMIN");

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-medium text-primary">Dashboard Pusat</p><h1 className="mt-1 text-2xl font-semibold">Selamat datang, {user.name}</h1><p className="mt-2 text-sm text-muted-foreground">Akses pusat tetap read-only pada MVP ini.</p></div>
      <EmptyState description="Ringkasan lintas gedung akan tersedia pada Fase 8." title="Belum ada ringkasan untuk ditampilkan" />
    </div>
  );
}
