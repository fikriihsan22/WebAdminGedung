import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { EventSessionLabel } from "@/components/event-session";
import { PaymentStatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const businessTimeZone = "Asia/Jakarta";
const weekdayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

type CalendarEvent = {
  id: string;
  clientName: string;
  eventDate: Temporal.Instant;
  paymentStatus: "UNPAID" | "DP_PAID" | "PAID";
  session: "DAY" | "NIGHT";
};

type MonthlyEventCalendarProps = {
  basePath: string;
  buildingId?: string;
  eventDetailPath?: string;
  events: CalendarEvent[];
  month: string;
};

function monthParts(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return { monthIndex: monthNumber - 1, year };
}

function formatMonth(month: string) {
  const { monthIndex, year } = monthParts(month);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: businessTimeZone }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

function monthKey(year: number, monthIndex: number) {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthOffset(month: string, offset: number) {
  const { monthIndex, year } = monthParts(month);
  return monthKey(year, monthIndex + offset);
}

function eventDateKey(eventDate: Temporal.Instant) {
  const date = eventDate.toZonedDateTimeISO(businessTimeZone);
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

function calendarDays(month: string) {
  const { monthIndex, year } = monthParts(month);
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const mondayIndex = (firstDay.getUTCDay() + 6) % 7;
  const firstGridDay = new Date(Date.UTC(year, monthIndex, 1 - mondayIndex));

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstGridDay);
    day.setUTCDate(firstGridDay.getUTCDate() + index);

    return {
      day: day.getUTCDate(),
      isCurrentMonth: day.getUTCMonth() === monthIndex,
      key: `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, "0")}-${String(day.getUTCDate()).padStart(2, "0")}`,
    };
  });
}

function calendarHref(basePath: string, month: string, buildingId?: string) {
  const params = new URLSearchParams({ month });
  if (buildingId) params.set("buildingId", buildingId);
  return `${basePath}?${params.toString()}`;
}

export function MonthlyEventCalendar({ basePath, buildingId, eventDetailPath, events, month }: MonthlyEventCalendarProps) {
  const eventByDate = Map.groupBy(events, (event) => eventDateKey(event.eventDate));
  const today = Temporal.Now.instant().toZonedDateTimeISO(businessTimeZone);
  const todayKey = `${today.year}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays aria-hidden className="size-5 text-primary" />
          <h2 aria-live="polite" className="font-semibold">{formatMonth(month)}</h2>
        </div>
        <nav aria-label="Navigasi bulan" className="flex flex-wrap gap-2">
          <Link aria-label={`Bulan sebelumnya, ${formatMonth(monthOffset(month, -1))}`} className={buttonVariants({ variant: "outline", size: "sm" })} href={calendarHref(basePath, monthOffset(month, -1), buildingId)}>
            <ChevronLeft aria-hidden />
            Sebelumnya
          </Link>
          <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={calendarHref(basePath, `${today.year}-${String(today.month).padStart(2, "0")}`, buildingId)}>
            Bulan ini
          </Link>
          <Link aria-label={`Bulan berikutnya, ${formatMonth(monthOffset(month, 1))}`} className={buttonVariants({ variant: "outline", size: "sm" })} href={calendarHref(basePath, monthOffset(month, 1), buildingId)}>
            Berikutnya
            <ChevronRight aria-hidden />
          </Link>
        </nav>
      </CardHeader>
      <CardContent className="px-0 pb-3 sm:px-5">
        <div aria-label="Geser horizontal untuk melihat semua hari dalam calendar" className="overflow-x-auto px-5 pb-2 sm:px-0" role="region" tabIndex={0}>
          <div className="min-w-[49rem]" role="grid" aria-label={`Calendar ${formatMonth(month)}. ${events.length} acara.`}>
            <div className="grid grid-cols-7 border-l border-t bg-muted/50">
              {weekdayLabels.map((weekday) => <div className="border-b border-r px-3 py-2 text-center text-xs font-semibold text-muted-foreground" key={weekday} role="columnheader">{weekday}</div>)}
              {calendarDays(month).map((date) => {
                const dateEvents = eventByDate.get(date.key) ?? [];
                const dateLabel = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: businessTimeZone }).format(new Date(`${date.key}T00:00:00.000Z`));

                return (
                  <section aria-label={`${dateLabel}, ${dateEvents.length} acara`} className={cn("min-h-36 border-b border-r p-2", !date.isCurrentMonth && "bg-muted/30 text-muted-foreground")} key={date.key} role="gridcell">
                    <p className={cn("flex size-6 items-center justify-center rounded-full text-xs font-semibold", date.key === todayKey && "bg-primary text-primary-foreground")}>{date.day}</p>
                    <div className="mt-2 space-y-2">
                      {dateEvents.map((event) => {
                        const content = <><p className="truncate font-medium">{event.clientName}</p><p className="mt-1 text-muted-foreground"><EventSessionLabel session={event.session} /></p><div className="mt-2"><PaymentStatusBadge status={event.paymentStatus} /></div></>;

                        return eventDetailPath ? (
                          <Link aria-label={`Lihat detail ${event.clientName}, sesi ${event.session === "DAY" ? "siang" : "malam"}`} className="block rounded-md border bg-background p-2 text-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" href={`${eventDetailPath}/${event.id}`} key={event.id}>
                            {content}
                          </Link>
                        ) : (
                          <article className="rounded-md border bg-background p-2 text-xs" key={event.id}>
                            {content}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
        {events.length === 0 ? <p className="px-5 pt-3 text-sm text-muted-foreground sm:px-0" role="status">Belum ada acara yang tercatat pada bulan ini.</p> : null}
      </CardContent>
    </Card>
  );
}
