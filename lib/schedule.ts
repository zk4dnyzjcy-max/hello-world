import { addISODays, parseISO } from "./dates";

export interface SkipPeriodInput {
  startDate: string;
  endDate: string;
  reason?: string | null;
}

export interface CalendarEntry {
  date: string;
  skipped: boolean;
  skipReason?: string | null;
  /** 1-based week number within the rotation template, absent when skipped. */
  weekNumber?: number;
  /** 0=Monday .. 6=Sunday, absent when skipped. */
  dayOfWeek?: number;
}

const MAX_SPAN_DAYS = 20 * 365; // guard against runaway loops on pathological ranges

function findSkip(skips: SkipPeriodInput[], iso: string): SkipPeriodInput | undefined {
  return skips.find((s) => s.startDate <= iso && iso <= s.endDate);
}

/**
 * Computes what the rotation assigns to each real calendar date in [from, to].
 *
 * The rotation never actually "ends" - it repeats every `totalDays` (weeksCount * 7)
 * days forever, which is what lets the app tell you what to cook on any date without
 * tracking which cycle you're on. Skip periods (vacations, one-off nights out) simply
 * pause the rotation pointer for their duration instead of consuming a rotation day,
 * so everything after them shifts forward by exactly that many days.
 */
export function computeCalendar(
  startDate: string | null,
  totalDays: number,
  skips: SkipPeriodInput[],
  from: string,
  to: string
): CalendarEntry[] {
  if (!startDate || totalDays <= 0 || to < startDate) return [];

  const span = (parseISO(to).getTime() - parseISO(startDate).getTime()) / 86400000;
  if (span > MAX_SPAN_DAYS) {
    throw new Error("Requested date range is too far from the plan's start date.");
  }

  const effectiveFrom = from < startDate ? startDate : from;
  const sortedSkips = [...skips].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const results: CalendarEntry[] = [];
  let pointer = 0;
  let date = startDate;

  while (date <= to) {
    const skip = findSkip(sortedSkips, date);
    if (date >= effectiveFrom) {
      if (skip) {
        results.push({ date, skipped: true, skipReason: skip.reason ?? null });
      } else {
        const idx = pointer % totalDays;
        results.push({
          date,
          skipped: false,
          weekNumber: Math.floor(idx / 7) + 1,
          dayOfWeek: idx % 7,
        });
      }
    }
    if (!skip) pointer++;
    date = addISODays(date, 1);
  }

  return results;
}
