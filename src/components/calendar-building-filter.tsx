import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type CalendarBuildingFilterProps = {
  buildings: Array<{ id: string; name: string }>;
  month: string;
  selectedBuildingId: string;
};

export function CalendarBuildingFilter({ buildings, month, selectedBuildingId }: CalendarBuildingFilterProps) {
  return (
    <form action="/central/calendar" className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-end">
      <input name="month" type="hidden" value={month} />
      <label className="grid min-w-0 flex-1 gap-2 text-sm font-medium">
        Gedung
        <Select defaultValue={selectedBuildingId} name="buildingId">
          {buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}
        </Select>
      </label>
      <Button type="submit">Tampilkan calendar</Button>
    </form>
  );
}
