"use client";

import { useRef, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { syncCompletedEventsAction } from "./actions";

export function SyncEventsButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function syncEvents() {
    startTransition(async () => {
      const { updatedCount } = await syncCompletedEventsAction();
      setResult(updatedCount === 0 ? "Tidak ada acara yang perlu disinkronkan." : `${updatedCount} acara berhasil diubah menjadi Selesai.`);
      dialogRef.current?.close();
    });
  }

  return (
    <div className="w-full sm:w-auto">
      <Button className="w-full sm:w-auto" onClick={() => dialogRef.current?.showModal()} type="button" variant="outline">
        <RefreshCw aria-hidden="true" /> Sinkronkan status acara
      </Button>
      {result ? <p className="mt-2 text-sm text-muted-foreground sm:text-right" role="status">{result}</p> : null}
      <dialog className="w-[calc(100%-2rem)] max-w-md rounded-xl border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40" ref={dialogRef}>
        <div className="p-5">
          <h2 className="text-lg font-semibold">Sinkronkan status acara?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Semua acara aktif sebelum hari ini akan diubah menjadi Selesai. Tindakan ini berlaku untuk seluruh gedung dan tidak mengikuti filter dashboard.</p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button disabled={isPending} onClick={() => dialogRef.current?.close()} type="button" variant="outline">Batal</Button>
            <Button disabled={isPending} onClick={syncEvents} type="button">{isPending ? "Menyinkronkan..." : "Ya, sinkronkan"}</Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
