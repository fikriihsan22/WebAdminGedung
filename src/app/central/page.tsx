import { CentralFilters } from "@/components/central-filters";
import { EventSessionLabel } from "@/components/event-session";
import { EmptyState } from "@/components/states";
import { EventStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireCentralAdmin } from "@/lib/server/auth";
import { getCentralDashboard } from "@/lib/server/central-dashboard";
import { parseCentralDashboardFilters } from "@/validation/dashboard";

export default async function CentralDashboardPage(props: PageProps<"/central">) {
  const user = await requireCentralAdmin();
  const filters = parseCentralDashboardFilters(await props.searchParams);
  const dashboard = await getCentralDashboard(filters);

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-medium text-primary">Dashboard Pusat</p><h1 className="mt-1 text-2xl font-semibold">Selamat datang, {user.name}</h1><p className="mt-2 text-sm text-muted-foreground">Pantau acara seluruh gedung. Akses ini bersifat read-only.</p></div>
      <CentralFilters buildings={dashboard.buildings} filters={filters} />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Ringkasan acara">
        <SummaryCard label="Total acara" value={dashboard.summary.totalEvents} />
        <SummaryCard label="Acara aktif" value={dashboard.summary.activeEvents} />
        <SummaryCard label="Dibatalkan" value={dashboard.summary.cancelledEvents} />
        <SummaryCard label="Total DP" value={formatCurrency(dashboard.summary.totalDownPayment)} />
        <SummaryCard label="Total pelunasan" value={formatCurrency(dashboard.summary.totalFinalPayment)} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader><h2 className="font-semibold">Daftar acara</h2></CardHeader>
          <CardContent>{dashboard.events.length === 0 ? <EmptyState description="Ubah atau reset filter untuk melihat acara lain." title="Tidak ada acara" /> : <div className="divide-y">{dashboard.events.map((event) => { const building = dashboard.buildings.find((item) => item.id === event.buildingId); return <article className="py-4 first:pt-0 last:pb-0" key={event.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium">{event.clientName}</h3><p className="mt-1 text-sm text-muted-foreground">{building?.name ?? "Gedung tidak ditemukan"} · {formatDate(event.eventDate)} · <EventSessionLabel session={event.session} /></p></div><div className="flex flex-wrap gap-2"><EventStatusBadge status={event.eventStatus} /><PaymentStatusBadge status={event.paymentStatus} /></div></div></article>; })}</div>}</CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Ringkasan per gedung</h2></CardHeader>
          <CardContent><div className="space-y-4">{dashboard.buildingSummary.map((building) => <div key={building.id}><p className="font-medium">{building.name}</p><p className="mt-1 text-sm text-muted-foreground">{building.totalEvents} acara · {building.activeEvents} aktif · {building.cancelledEvents} dibatalkan</p></div>)}</div></CardContent>
        </Card>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></CardContent></Card>;
}
