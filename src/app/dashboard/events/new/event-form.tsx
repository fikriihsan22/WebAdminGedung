"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createEventAction, type CreateEventActionState } from "./actions";
import { eventFormData, eventFormSchema } from "@/validation/event";

const initialState: CreateEventActionState = {};

export function EventForm() {
  const [state, formAction, isPending] = useActionState(createEventAction, initialState);
  const [clientError, setClientError] = useState<string>();

  return (
    <form
      action={formAction}
      className="space-y-5"
      onSubmit={(event) => {
        const parsed = eventFormSchema.safeParse(eventFormData(new FormData(event.currentTarget)));

        if (!parsed.success) {
          event.preventDefault();
          setClientError("Periksa kembali data acara yang diisi.");
          return;
        }

        setClientError(undefined);
      }}
    >
      <Field label="Nama client"><Input autoComplete="organization" maxLength={160} name="clientName" required /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tanggal acara"><Input name="eventDate" required type="date" /></Field>
        <Field label="Sesi"><Select defaultValue="" name="session" required><option disabled value="">Pilih sesi</option><option value="DAY">Siang</option><option value="NIGHT">Malam</option></Select></Field>
      </div>
      <Field label="Total tagihan"><CurrencyInput defaultValue="0" name="totalAmount" required /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Jumlah DP"><CurrencyInput name="downPayment" placeholder="Minimal Rp1" required /></Field>
        <Field label="Pelunasan (opsional)"><CurrencyInput defaultValue="0" name="finalPayment" /></Field>
      </div>
      {clientError || state.error ? <p className="text-sm text-destructive" role="alert">{clientError ?? state.error}</p> : null}
      <Button className="w-full sm:w-auto" disabled={isPending} type="submit">{isPending ? "Menyimpan..." : "Simpan acara"}</Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium">{label}{children}</label>;
}
