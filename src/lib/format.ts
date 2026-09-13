const indonesianLocale = "id-ID";

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat(indonesianLocale, {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

type DateValue = Date | string | Temporal.Instant;

function toDate(value: DateValue) {
  if (value instanceof Date) {
    return value;
  }

  return new Date(typeof value === "string" ? value : value.epochMilliseconds);
}

export const formatDate = (value: DateValue) =>
  new Intl.DateTimeFormat(indonesianLocale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(toDate(value));

export const formatShortDate = (value: DateValue) =>
  new Intl.DateTimeFormat(indonesianLocale, {
    day: "2-digit",
    month: "short",
  }).format(toDate(value));
