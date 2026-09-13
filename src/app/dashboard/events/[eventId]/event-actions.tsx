"use client";

import { useActionState } from "react";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { cancelEventAction, recordFinalPaymentAction, type EventActionState } from "./actions";

const initialState: EventActionState = {};

export function EventActions({ eventId, finalPayment }: { eventId: string; finalPayment: number }) {
  const paymentAction = recordFinalPaymentAction.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(paymentAction, initialState);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Input pelunasan</h2>
        <p className="mt-1 text-sm text-muted-foreground">Masukkan nilai pelunasan akhir. Nilai ini tidak ditambahkan sebagai transaksi terpisah.</p>
        <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="finalPayment">Nilai pelunasan</label>
          <Input defaultValue={finalPayment} id="finalPayment" inputMode="numeric" min="0" name="finalPayment" required type="number" />
          <Button disabled={isPending} type="submit">{isPending ? "Menyimpan..." : "Simpan"}</Button>
        </form>
        {state.error ? <p className="mt-3 text-sm text-destructive" role="alert">{state.error}</p> : null}
      </section>
      <section className="rounded-xl border border-destructive/30 bg-card p-5">
        <h2 className="font-semibold">Batalkan acara</h2>
        <p className="mt-1 text-sm text-muted-foreground">Acara tetap tersimpan sebagai histori dan slotnya dapat digunakan kembali.</p>
        <div className="mt-4"><ConfirmationDialog confirmLabel="Ya, batalkan" description="Status acara akan berubah menjadi dibatalkan. Tindakan ini tidak menghapus data pembayaran." onConfirm={() => cancelEventAction(eventId)} title="Batalkan acara ini?" triggerLabel="Batalkan acara" /></div>
      </section>
    </div>
  );
}
