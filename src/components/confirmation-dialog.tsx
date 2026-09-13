"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/button";

type ConfirmationDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm?: () => void | Promise<void>;
};

export function ConfirmationDialog({ triggerLabel, title, description, confirmLabel, onConfirm }: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button onClick={() => dialogRef.current?.showModal()} type="button" variant="outline">
        {triggerLabel}
      </Button>
      <dialog className="w-[calc(100%-2rem)] max-w-md rounded-xl border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40" ref={dialogRef}>
        <div className="p-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => dialogRef.current?.close()} type="button" variant="outline">Batal</Button>
            <Button
              onClick={async () => {
                await onConfirm?.();
                dialogRef.current?.close();
              }}
              type="button"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
