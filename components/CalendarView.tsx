"use client";

import { useEffect, useState } from "react";
import { addISODays, formatDateLong, todayISO } from "@/lib/dates";
import { CalendarEntryDTO } from "@/lib/types";
import { readJson } from "@/lib/apiClient";

const WINDOW_DAYS = 14;

export default function CalendarView({ planId, token }: { planId: string; token: string }) {
  const [anchor, setAnchor] = useState(todayISO());
  const [entries, setEntries] = useState<CalendarEntryDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const to = addISODays(anchor, WINDOW_DAYS - 1);
    fetch(`/api/plans/${planId}/calendar?token=${encodeURIComponent(token)}&from=${anchor}&to=${to}`)
      .then((res) => readJson<CalendarEntryDTO[]>(res))
      .then((data) => {
        if (!cancelled) {
          setEntries(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [planId, token, anchor]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setAnchor((a) => addISODays(a, -WINDOW_DAYS))}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          &larr; Previous
        </button>
        <button
          onClick={() => setAnchor(todayISO())}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950"
        >
          Today
        </button>
        <button
          onClick={() => setAnchor((a) => addISODays(a, WINDOW_DAYS))}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          Next &rarr;
        </button>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!entries && !error && <p className="text-sm text-stone-500 dark:text-stone-400">Loading...</p>}

      {entries && entries.length === 0 && (
        <p className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
          No start date has been set for this plan yet.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {entries?.map((entry) => (
          <li
            key={entry.date}
            className={`rounded-xl border p-4 ${
              entry.date === todayISO()
                ? "border-orange-400 bg-orange-50 dark:border-orange-700 dark:bg-orange-950"
                : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
            }`}
          >
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
              {formatDateLong(entry.date)}
            </p>
            {entry.skipped ? (
              <p className="mt-1 text-stone-600 italic dark:text-stone-400">
                Skipped{entry.skipReason ? ` — ${entry.skipReason}` : ""}
              </p>
            ) : entry.slot?.mealName || (entry.slot?.ingredients?.length ?? 0) > 0 ? (
              <div className="mt-1 flex flex-col gap-1">
                <p className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {entry.slot?.mealName || "Untitled meal"}
                </p>
                {entry.slot?.recipeUrl && (
                  <a
                    href={entry.slot.recipeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-700 hover:underline dark:text-orange-400"
                  >
                    View recipe &rarr;
                  </a>
                )}
                {entry.slot && entry.slot.ingredients.length > 0 && (
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {entry.slot.ingredients.map((i) => i.name).join(", ")}
                  </p>
                )}
                {entry.slot?.notes && (
                  <p className="text-sm text-stone-600 dark:text-stone-400">{entry.slot.notes}</p>
                )}
              </div>
            ) : (
              <p className="mt-1 text-stone-400 dark:text-stone-500">No meal planned</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
