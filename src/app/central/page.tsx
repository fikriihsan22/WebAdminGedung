import Link from "next/link";

import { CentralFilters } from "@/components/central-filters";
import { EventSessionLabel } from "@/components/event-session";
import { EmptyState } from "@/components/states";
import { EventStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { requireCentralAdmin } from "@/lib/server/auth";
import { getCentralDashboard } from "@/lib/server/central-dashboard";
import { parseCentralDashboardFilters, type CentralDashboardFilters } from "@/validation/dashboard";

import { SyncEventsButton } from "./sync-events-button";

export default async function CentralDashboardPage(props: PageProps<"/central">) {
  const user = await requireCentralAdmin();
  const filters = parseCentralDashboardFilters(await props.searchParams);
  const dashboard = await getCentralDashboard(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-sm font-medium text-primary">Dashboard Pusat</p><h1 className="mt-1 text-2xl font-semibold">Selamat datang, {user.name}</h1><p className="mt-2 text-sm text-muted-foreground">Pantau acara seluruh gedung dan sinkronkan status acara yang telah selesai.</p></div>
        <SyncEventsButton />
      </div>
      {dashboard.defaultYear ? <p className="text-sm text-muted-foreground">Menampilkan tahun {dashboard.defaultYear}.</p> : null}
      <CentralFilters buildings={dashboard.buildings} filters={filters} />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ringkasan acara">
        <SummaryCard label="Total acara" value={dashboard.summary.totalEvents} />
        <SummaryCard label="Acara aktif" value={dashboard.summary.activeEvents} />
        <SummaryCard label="Acara selesai" value={dashboard.summary.completedEvents} />
        <SummaryCard label="Dibatalkan" value={dashboard.summary.cancelledEvents} />
      </section>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4"><h2 className="font-semibold">Daftar acara</h2><span className="text-sm text-muted-foreground">{dashboard.pagination.totalEvents} hasil</span></CardHeader>
        <CardContent>{dashboard.events.length === 0 ? <EmptyState description="Ubah atau reset filter untuk melihat acara lain." title="Tidak ada acara" /> : <><div className="divide-y">{dashboard.events.map((event) => { const building = dashboard.buildings.find((item) => item.id === event.buildingId); return <article className="py-4 first:pt-0 last:pb-0" key={event.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium">{event.clientName}</h3><p className="mt-1 text-sm text-muted-foreground">{building?.name ?? "Gedung tidak ditemukan"} · {formatDate(event.eventDate)} · <EventSessionLabel session={event.session} /></p></div><div className="flex flex-wrap gap-2"><EventStatusBadge status={event.eventStatus} /><PaymentStatusBadge status={event.paymentStatus} /></div></div></article>; })}</div><CentralPagination filters={filters} pagination={dashboard.pagination} /></>}</CardContent>
      </Card>
      <Card>
        <CardHeader><h2 className="font-semibold">Ringkasan per gedung</h2></CardHeader>
        <CardContent><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{dashboard.buildingSummary.map((building) => <article className="rounded-lg border p-4" key={building.id}><h3 className="font-medium">{building.name}</h3><p className="mt-2 text-sm text-muted-foreground">{building.totalEvents} acara · {building.activeEvents} aktif · {building.completedEvents} selesai · {building.cancelledEvents} dibatalkan</p></article>)}</div>{dashboard.hasMoreBuildings ? <div className="mt-4"><Link className={buttonVariants({ variant: "outline" })} href={centralDashboardHref(filters, { buildingPage: filters.buildingPage + 1 })}>Lihat gedung lainnya</Link></div> : null}</CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></CardContent></Card>;
}

function CentralPagination({ filters, pagination }: { filters: CentralDashboardFilters; pagination: { page: number; totalPages: number; totalEvents: number; from: number; to: number } }) {
  if (pagination.totalPages <= 1) return null;

  const pages = pageNumbers(pagination.page, pagination.totalPages);

  return <nav aria-label="Pagination daftar acara" className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Menampilkan {pagination.from}–{pagination.to} dari {pagination.totalEvents} acara</p><div className="flex flex-wrap gap-2"><PaginationLink disabled={pagination.page === 1} filters={filters} label="Sebelumnya" page={pagination.page - 1} />{pages.map((page, index) => page === "ellipsis" ? <span className="px-2 py-1 text-sm text-muted-foreground" key={`ellipsis-${index}`}>…</span> : <PaginationLink current={page === pagination.page} filters={filters} key={page} label={String(page)} page={page} />)}<PaginationLink disabled={pagination.page === pagination.totalPages} filters={filters} label="Berikutnya" page={pagination.page + 1} /></div></nav>;
}

function PaginationLink({ filters, page, label, current, disabled }: { filters: CentralDashboardFilters; page: number; label: string; current?: boolean; disabled?: boolean }) {
  if (disabled) return <span aria-disabled="true" className={buttonVariants({ variant: "outline" })}>{label}</span>;

  return <Link aria-current={current ? "page" : undefined} className={buttonVariants({ variant: current ? "default" : "outline" })} href={centralDashboardHref(filters, { page })}>{label}</Link>;
}

function pageNumbers(currentPage: number, totalPages: number) {
  const pages: Array<number | "ellipsis"> = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  if (start > 1) pages.push(1);
  if (start > 2) pages.push("ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("ellipsis");
  if (end < totalPages) pages.push(totalPages);

  return pages;
}

function centralDashboardHref(filters: CentralDashboardFilters, updates: Partial<Pick<CentralDashboardFilters, "page" | "buildingPage">>) {
  const params = new URLSearchParams();
  const values = { ...filters, ...updates };

  for (const key of ["buildingId", "startDate", "endDate", "session", "eventStatus", "paymentStatus"] as const) {
    if (values[key]) params.set(key, values[key]);
  }
  if (values.page > 1) params.set("page", String(values.page));
  if (values.buildingPage > 1) params.set("buildingPage", String(values.buildingPage));

  const query = params.toString();
  return query ? `/central?${query}` : "/central";
}
