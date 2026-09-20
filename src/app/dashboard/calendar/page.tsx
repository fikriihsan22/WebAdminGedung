import { MonthlyEventCalendar } from "@/components/monthly-event-calendar";
import { getBuildingCalendar } from "@/lib/server/calendar";
import { parseCalendarFilters } from "@/validation/calendar";

export default async function BuildingCalendarPage(props: PageProps<"/dashboard/calendar">) {
  const filters = parseCalendarFilters(await props.searchParams);
  const calendar = await getBuildingCalendar(filters);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Jadwal Gedung</p>
        <h1 className="mt-1 text-2xl font-semibold">Calendar</h1>
        <p className="mt-2 text-sm text-muted-foreground">Lihat jadwal acara gedung Anda per bulan.</p>
      </div>
      <MonthlyEventCalendar basePath="/dashboard/calendar" eventDetailPath="/dashboard/events" events={calendar.events} month={calendar.month} />
    </div>
  );
}
