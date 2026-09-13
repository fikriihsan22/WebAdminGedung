import Link from "next/link";

import { EventSessionLabel } from "@/components/event-session";
import { EventStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { getBuildingEvent } from "@/lib/server/events";

export default async function EventDetailPage(props: PageProps<"/dashboard/events/[eventId]">) {
  const { eventId } = await props.params;
  const { created } = await props.searchParams;
  const event = await getBuildingEvent(eventId);

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm font-medium text-primary hover:underline" href="/dashboard">← Kembali ke daftar</Link>
        <h1 className="mt-3 text-2xl font-semibold">{event.clientName}</h1>
        <div className="mt-3 flex flex-wrap gap-2"><EventStatusBadge status={event.eventStatus} /><PaymentStatusBadge status={event.paymentStatus} /></div>
      </div>
      {created === "1" ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">Acara berhasil dicatat.</p> : null}
      <Card>
        <CardHeader><h2 className="font-semibold">Informasi acara</h2></CardHeader>
        <CardContent className="grid gap-5 text-sm sm:grid-cols-2">
          <DetailItem label="Tanggal" value={formatDate(event.eventDate)} />
          <DetailItem label="Sesi" value={<EventSessionLabel session={event.session} />} />
          <DetailItem label="Total tagihan" value={formatCurrency(event.totalAmount)} />
          <DetailItem label="DP" value={formatCurrency(event.downPayment)} />
          <DetailItem label="Pelunasan" value={formatCurrency(event.finalPayment)} />
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">Halaman ini bersifat baca saja. Pelunasan dan pembatalan acara tersedia pada Fase 7.</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>;
}
