const indonesianLocale = "id-ID";

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat(indonesianLocale, {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat(indonesianLocale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export const formatShortDate = (value: Date | string) =>
  new Intl.DateTimeFormat(indonesianLocale, {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
