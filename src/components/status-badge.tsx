import { cn } from "@/lib/utils";

type EventStatus = "ACTIVE" | "CANCELLED";
type PaymentStatus = "UNPAID" | "DP_PAID" | "PAID";

const eventStatusConfig: Record<EventStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Aktif", className: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Dibatalkan", className: "bg-rose-100 text-rose-800" },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  UNPAID: { label: "Belum bayar", className: "bg-slate-100 text-slate-700" },
  DP_PAID: { label: "DP dibayar", className: "bg-amber-100 text-amber-800" },
  PAID: { label: "Lunas", className: "bg-sky-100 text-sky-800" },
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const config = eventStatusConfig[status];
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", config.className)}>{config.label}</span>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = paymentStatusConfig[status];
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", config.className)}>{config.label}</span>;
}
