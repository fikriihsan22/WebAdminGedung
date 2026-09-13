import { z } from "zod";

const moneyInput = z.coerce.number().int("Nominal harus berupa angka bulat.").min(0, "Nominal tidak boleh negatif.");

export const eventFormSchema = z.object({
  clientName: z.string().trim().min(1, "Nama client wajib diisi.").max(160),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal acara tidak valid."),
  session: z.enum(["DAY", "NIGHT"], "Sesi acara wajib dipilih."),
  totalAmount: moneyInput,
  downPayment: moneyInput,
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
