export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Parse an ISO "yyyy-mm-dd" string as a UTC calendar date (no timezone drift). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function addISODays(iso: string, days: number): string {
  return toISO(addDays(parseISO(iso), days));
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Monday-based day-of-week index (0=Monday .. 6=Sunday) for an ISO date. */
export function dayOfWeekIndex(iso: string): number {
  const jsDay = parseISO(iso).getUTCDay(); // 0=Sunday..6=Saturday
  return (jsDay + 6) % 7;
}

/** ISO date of the Monday on or before the given ISO date. */
export function startOfWeek(iso: string): string {
  return addISODays(iso, -dayOfWeekIndex(iso));
}

export function formatDateLong(iso: string): string {
  const d = parseISO(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateShort(iso: string): string {
  const d = parseISO(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
