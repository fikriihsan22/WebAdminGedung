export type PaymentStatus = "UNPAID" | "DP_PAID" | "PAID";

export function getPaymentStatus({ totalAmount, downPayment, finalPayment }: { totalAmount: number; downPayment: number; finalPayment: number }): PaymentStatus {
  const paidAmount = downPayment + finalPayment;

  if (paidAmount === 0) {
    return "UNPAID";
  }

  return paidAmount >= totalAmount ? "PAID" : "DP_PAID";
}
