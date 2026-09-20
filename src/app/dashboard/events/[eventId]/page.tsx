import Link from "next/link";

import { EventSessionLabel } from "@/components/event-session";
import { EventStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { getBuildingEvent } from "@/lib/server/events";

import { EventActions } from "./event-actions";

export default async function EventDetailPage(props: PageProps<"/dashboard/events/[eventId]">) {
  const { eventId } = await props.params;
  const { created, settled, cancelled } = await props.searchParams;
  const event = await getBuildingEvent(eventId);

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm font-medium text-primary hover:underline" href="/dashboard">← Kembali ke daftar</Link>
        <h1 className="mt-3 text-2xl font-semibold">{event.clientName}</h1>
        <div className="mt-3 flex flex-wrap gap-2"><EventStatusBadge status={event.eventStatus} /><PaymentStatusBadge status={event.paymentStatus} /></div>
      </div>
      {created === "1" ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">Acara berhasil dicatat.</p> : null}
      {settled === "1" ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">Pelunasan berhasil diperbarui.</p> : null}
      {cancelled === "1" ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">Acara berhasil dibatalkan.</p> : null}
      {cancelled === "not-active" ? <p className="rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground" role="status">Hanya acara aktif yang dapat dibatalkan.</p> : null}
      <Card>
        <CardHeader><h2 className="font-semibold">Informasi acara</h2></CardHeader>
        <CardContent className="grid gap-5 text-sm sm:grid-cols-2">
          <DetailItem label="Tanggal" value={formatDate(event.eventDate)} />
          <DetailItem label="Ruang" value={event.spaceName} />
          <DetailItem label="Sesi" value={<EventSessionLabel session={event.session} />} />
          <DetailItem label="Total tagihan" value={formatCurrency(event.totalAmount)} />
          <DetailItem label="DP" value={formatCurrency(event.downPayment)} />
          <DetailItem label="Pelunasan" value={formatCurrency(event.finalPayment)} />
        </CardContent>
      </Card>
      {event.eventStatus === "ACTIVE" ? <EventActions eventId={event.id} finalPayment={event.finalPayment} /> : <p className="text-sm text-muted-foreground">Hanya acara aktif yang dapat menerima pelunasan baru atau dibatalkan.</p>}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>;
}
