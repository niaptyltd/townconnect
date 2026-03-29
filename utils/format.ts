import type { DayHours } from "@/types";

export function formatCurrency(value: number, currency = "ZAR", locale = "en-ZA") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPhone(phone: string) {
  if (!phone) return "";
  return phone.replace(/(\+27)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4");
}

export function formatDate(value: string, locale = "en-ZA") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatTimeWindow(dayHours: DayHours) {
  if (dayHours.closed) return "Closed";
  return `${dayHours.open} - ${dayHours.close}`;
}
