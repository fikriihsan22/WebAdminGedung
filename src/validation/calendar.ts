import { z } from "zod";

const businessTimeZone = "Asia/Jakarta";

const optionalValue = z.preprocess((value) => (value === "" ? undefined : value), z.string().optional());
const optionalMonth = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
);

export const calendarFiltersSchema = z.object({
  buildingId: optionalValue,
  month: optionalMonth,
});

export type CalendarFilters = z.infer<typeof calendarFiltersSchema> & {
  month: string;
};

function currentCalendarMonth() {
  const today = Temporal.Now.instant().toZonedDateTimeISO(businessTimeZone);
  return `${today.year}-${String(today.month).padStart(2, "0")}`;
}

export function parseCalendarFilters(searchParams: Record<string, string | string[] | undefined>): CalendarFilters {
  const firstValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const parsed = calendarFiltersSchema.safeParse({
    buildingId: firstValue("buildingId"),
    month: firstValue("month"),
  });

  if (!parsed.success) {
    return { month: currentCalendarMonth() };
  }

  return { ...parsed.data, month: parsed.data.month ?? currentCalendarMonth() };
}
