import { z } from "zod";

const optionalValue = z.preprocess((value) => (value === "" ? undefined : value), z.string().optional());
const optionalDate = z.preprocess((value) => (value === "" ? undefined : value), z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional());

export const centralDashboardFiltersSchema = z.object({
  buildingId: optionalValue,
  startDate: optionalDate,
  endDate: optionalDate,
  session: z.preprocess((value) => (value === "" ? undefined : value), z.enum(["DAY", "NIGHT"]).optional()),
  eventStatus: z.preprocess((value) => (value === "" ? undefined : value), z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional()),
  paymentStatus: z.preprocess((value) => (value === "" ? undefined : value), z.enum(["UNPAID", "DP_PAID", "PAID"]).optional()),
});

export type CentralDashboardFilters = z.infer<typeof centralDashboardFiltersSchema>;

export function parseCentralDashboardFilters(searchParams: Record<string, string | string[] | undefined>): CentralDashboardFilters {
  const firstValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const parsed = centralDashboardFiltersSchema.safeParse({
    buildingId: firstValue("buildingId"),
    startDate: firstValue("startDate"),
    endDate: firstValue("endDate"),
    session: firstValue("session"),
    eventStatus: firstValue("eventStatus"),
    paymentStatus: firstValue("paymentStatus"),
  });

  return parsed.success ? parsed.data : {};
}
