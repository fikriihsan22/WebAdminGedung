"use client";

import { ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";

export default function CentralCalendarError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState action={<Button onClick={reset}>Coba lagi</Button>} description="Silakan coba memuat ulang calendar pusat." title="Calendar tidak dapat dimuat" />;
}
