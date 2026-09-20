import { CalendarBuildingFilter } from "@/components/calendar-building-filter";
import { MonthlyEventCalendar } from "@/components/monthly-event-calendar";
import { EmptyState } from "@/components/states";
import { getCentralCalendar } from "@/lib/server/calendar";
import { parseCalendarFilters } from "@/validation/calendar";

export default async function CentralCalendarPage(props: PageProps<"/central/calendar">) {
  const filters = parseCalendarFilters(await props.searchParams);
  const calendar = await getCentralCalendar(filters);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Jadwal Pusat</p>
        <h1 className="mt-1 text-2xl font-semibold">Calendar</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pantau jadwal bulanan untuk satu gedung yang dipilih.</p>
      </div>
      {calendar.selectedBuilding ? (
        <>
          <CalendarBuildingFilter buildings={calendar.buildings} month={calendar.month} selectedBuildingId={calendar.selectedBuilding.id} />
          <MonthlyEventCalendar basePath="/central/calendar" buildingId={calendar.selectedBuilding.id} events={calendar.events} month={calendar.month} />
        </>
      ) : <EmptyState description="Tambahkan gedung terlebih dahulu untuk melihat calendar." title="Belum ada gedung" />}
    </div>
  );
}
