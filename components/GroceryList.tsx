"use client";

import { useEffect, useState } from "react";
import { addISODays, formatDateLong, startOfWeek, todayISO } from "@/lib/dates";
import { GroceryListDTO } from "@/lib/types";

const POLL_MS = 5000;

export default function GroceryList({ planId, token }: { planId: string; token: string }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(todayISO()));
  const [list, setList] = useState<GroceryListDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for updates so a collaborator's grocery checkmarks on the share link show up here too.
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(
          `/api/plans/${planId}/grocery?token=${encodeURIComponent(token)}&weekStart=${weekStart}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load grocery list.");
        if (!cancelled) {
          setList(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [planId, token, weekStart]);

  async function toggle(itemName: string, checked: boolean) {
    setList((l) =>
      l ? { ...l, items: l.items.map((i) => (i.name === itemName ? { ...i, checked } : i)) } : l
    );
    await fetch(`/api/plans/${planId}/grocery/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, weekStartDate: weekStart, itemName, checked }),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekStart((w) => addISODays(w, -7))}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          &larr; Previous week
        </button>
        <button
          onClick={() => setWeekStart(startOfWeek(todayISO()))}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950"
        >
          This week
        </button>
        <button
          onClick={() => setWeekStart((w) => addISODays(w, 7))}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          Next week &rarr;
        </button>
      </div>

      {list && (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {formatDateLong(list.weekStartDate)} &ndash; {formatDateLong(list.weekEndDate)}
        </p>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!list && !error && <p className="text-sm text-stone-500 dark:text-stone-400">Loading...</p>}

      {list && list.items.length === 0 && (
        <p className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
          No ingredients needed this week.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {list?.items.map((item) => (
          <li
            key={item.itemKey}
            className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => toggle(item.name, e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-stone-300 text-orange-600 focus:ring-orange-500 dark:border-stone-600"
            />
            <div className="min-w-0">
              <p
                className={`font-medium ${
                  item.checked
                    ? "text-stone-400 line-through dark:text-stone-600"
                    : "text-stone-900 dark:text-stone-100"
                }`}
              >
                {item.name}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500">for {item.neededFor.join(", ")}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
