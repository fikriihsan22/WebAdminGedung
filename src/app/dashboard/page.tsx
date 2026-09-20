import Link from "next/link";

import { EventSessionLabel } from "@/components/event-session";
import { EmptyState } from "@/components/states";
import { EventStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/server/auth";
import { listBuildingEvents } from "@/lib/server/events";

export default async function BuildingDashboardPage() {
  const user = await requireRole("BUILDING_ADMIN");
  const events = await listBuildingEvents();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-sm font-medium text-primary">Acara Gedung</p><h1 className="mt-1 text-2xl font-semibold">Selamat datang, {user.name}</h1><p className="mt-2 text-sm text-muted-foreground">Jadwal acara terdekat ditampilkan lebih dahulu.</p></div>
          <Link className={buttonVariants()} href="/dashboard/events/new">Tambah acara</Link>
        </div>
      </div>
      {events.length === 0 ? (
        <EmptyState description="Acara yang dicatat untuk gedung Anda akan tampil di sini." title="Belum ada acara" />
      ) : (
        <div className="grid gap-3" aria-label="Daftar acara">
          {events.map((event) => (
            <Link href={`/dashboard/events/${event.id}`} key={event.id}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><h2 className="truncate font-semibold">{event.clientName}</h2><p className="mt-1 text-sm text-muted-foreground">{event.spaceName} · {formatDate(event.eventDate)} · <EventSessionLabel session={event.session} /></p></div>
                    <span className="shrink-0 text-sm text-muted-foreground">Detail</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2"><EventStatusBadge status={event.eventStatus} /><PaymentStatusBadge status={event.paymentStatus} /></div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
