"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";

type CurrencyInputProps = Omit<React.ComponentProps<"input">, "defaultValue" | "name" | "onChange" | "type" | "value"> & {
  defaultValue?: number | string;
  name: string;
};

function numericValue(value: number | string | undefined) {
  return value === undefined ? "" : String(value).replace(/\D/g, "");
}

function formatCurrencyInput(value: string) {
  if (!value) return "";

  return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Number(value))}`;
}

export function CurrencyInput({ defaultValue, name, ...props }: CurrencyInputProps) {
  const [value, setValue] = useState(() => numericValue(defaultValue));

  return (
    <>
      <Input
        {...props}
        inputMode="numeric"
        onChange={(event) => setValue(numericValue(event.target.value))}
        type="text"
        value={formatCurrencyInput(value)}
      />
      <input name={name} type="hidden" value={value} />
    </>
  );
}
