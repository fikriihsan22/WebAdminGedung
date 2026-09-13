import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CentralDashboardFilters } from "@/validation/dashboard";

type CentralFiltersProps = {
  buildings: Array<{ id: string; name: string }>;
  filters: CentralDashboardFilters;
};

export function CentralFilters({ buildings, filters }: CentralFiltersProps) {
  return (
    <form action="/central" className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
      <Select defaultValue={filters.buildingId ?? ""} name="buildingId"><option value="">Semua gedung</option>{buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</Select>
      <Input defaultValue={filters.startDate ?? ""} name="startDate" type="date" />
      <Input defaultValue={filters.endDate ?? ""} name="endDate" type="date" />
      <Select defaultValue={filters.session ?? ""} name="session"><option value="">Semua sesi</option><option value="DAY">Siang</option><option value="NIGHT">Malam</option></Select>
      <Select defaultValue={filters.eventStatus ?? ""} name="eventStatus"><option value="">Semua status acara</option><option value="ACTIVE">Aktif</option><option value="CANCELLED">Dibatalkan</option></Select>
      <Select defaultValue={filters.paymentStatus ?? ""} name="paymentStatus"><option value="">Semua status pembayaran</option><option value="UNPAID">Belum bayar</option><option value="DP_PAID">DP dibayar</option><option value="PAID">Lunas</option></Select>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-3"><Button type="submit">Terapkan filter</Button><Button render={<Link href="/central" />} type="button" variant="outline">Reset</Button></div>
    </form>
  );
}
