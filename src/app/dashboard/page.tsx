import { EmptyState } from "@/components/states";
import { requireRole } from "@/lib/server/auth";

export default async function BuildingDashboardPage() {
  const user = await requireRole("BUILDING_ADMIN");

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-medium text-primary">Dashboard Gedung</p><h1 className="mt-1 text-2xl font-semibold">Selamat datang, {user.name}</h1><p className="mt-2 text-sm text-muted-foreground">Daftar acara gedung akan tersedia pada fase berikutnya.</p></div>
      <EmptyState description="Belum ada ringkasan acara yang dapat ditampilkan." title="Acara Anda akan tampil di sini" />
    </div>
  );
}
