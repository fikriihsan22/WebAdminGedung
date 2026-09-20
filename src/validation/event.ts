import { z } from "zod";

const moneyValue = z.number().int("Nominal harus berupa angka bulat.").min(0, "Nominal tidak boleh negatif.");
const moneyInput = z.coerce.number().pipe(moneyValue);
const requiredMoneyInput = z
  .string()
  .trim()
  .min(1, "Nominal wajib diisi.")
  .transform(Number)
  .pipe(moneyValue);
const requiredPositiveMoneyInput = z
  .string()
  .trim()
  .min(1, "Nominal wajib diisi.")
  .transform(Number)
  .pipe(moneyValue.min(1, "Jumlah DP wajib lebih dari Rp0."));

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export const eventFormSchema = z.object({
  clientName: z.string().trim().min(1, "Nama client wajib diisi.").max(160),
  eventDate: z.string().refine(isCalendarDate, "Tanggal acara tidak valid."),
  session: z.enum(["DAY", "NIGHT"], "Sesi acara wajib dipilih."),
  totalAmount: requiredMoneyInput,
  downPayment: requiredPositiveMoneyInput,
  finalPayment: z.preprocess((value) => (value === "" || value === null ? 0 : value), moneyInput),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;

export function eventFormData(formData: FormData) {
  return {
    clientName: formData.get("clientName"),
    eventDate: formData.get("eventDate"),
    session: formData.get("session"),
    totalAmount: formData.get("totalAmount"),
    downPayment: formData.get("downPayment"),
    finalPayment: formData.get("finalPayment"),
  };
}

export const finalPaymentSchema = z.object({
  finalPayment: z.preprocess((value) => (value === "" || value === null ? undefined : value), moneyInput),
});

export const cancelEventSchema = z.object({
  eventId: z.string().uuid(),
});
