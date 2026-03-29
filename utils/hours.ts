import type { Business, DayHours, OperatingHours } from "@/types";

const dayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
] as const;

export function getDayHours(hours: OperatingHours, date = new Date()): DayHours {
  const key = dayNames[date.getDay()];
  return hours[key];
}

export function isBusinessOpenNow(business: Business, date = new Date()) {
  const hours = getDayHours(business.operatingHours, date);
  if (hours.closed) return false;

  const current = date.getHours() * 60 + date.getMinutes();
  const [openHour, openMinute] = hours.open.split(":").map(Number);
  const [closeHour, closeMinute] = hours.close.split(":").map(Number);
  const openTotal = openHour * 60 + openMinute;
  const closeTotal = closeHour * 60 + closeMinute;

  return current >= openTotal && current <= closeTotal;
}

export function getTodayOperatingLabel(business: Business, date = new Date()) {
  const hours = getDayHours(business.operatingHours, date);
  if (hours.closed) return "Closed today";
  return `Open today: ${hours.open} - ${hours.close}`;
}
