"use client";

import { useState } from "react";
import { formatDateLong, todayISO } from "@/lib/dates";
import { SkipPeriodDTO } from "@/lib/types";

interface Props {
  planId: string;
  token: string;
  skipPeriods: SkipPeriodDTO[];
  onChange: (skipPeriods: SkipPeriodDTO[]) => void;
}

export default function SkipManager({ planId, token, skipPeriods, onChange }: Props) {
  const today = todayISO();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${planId}/skips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, startDate, endDate, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not add.");
      onChange([...skipPeriods, data].sort((a, b) => a.startDate.localeCompare(b.startDate)));
      setReason("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    await fetch(`/api/plans/${planId}/skips/${id}?token=${encodeURIComponent(token)}`, {
      method: "DELETE",
    });
    onChange(skipPeriods.filter((s) => s.id !== id));
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Skip a day or week</h3>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Vacation, date night, whatever &mdash; pick the dates you won&apos;t be cooking and the rest
          of the rotation shifts forward automatically. Nothing gets skipped in the rotation itself,
          it just waits.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-lg border border-stone-200 p-4 dark:border-stone-800">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-600 dark:text-stone-400">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value > endDate) setEndDate(e.target.value);
              }}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone-600 dark:text-stone-400">To</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
          </div>
          <div className="flex flex-1 min-w-[10rem] flex-col gap-1">
            <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Vacation"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add skip"}
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {skipPeriods.length === 0 && (
          <li className="text-sm text-stone-500 dark:text-stone-400">No skipped days yet.</li>
        )}
        {skipPeriods.map((skip) => (
          <li
            key={skip.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900"
          >
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                {formatDateLong(skip.startDate)}
                {skip.endDate !== skip.startDate && <> &ndash; {formatDateLong(skip.endDate)}</>}
              </p>
              {skip.reason && <p className="text-sm text-stone-500 dark:text-stone-400">{skip.reason}</p>}
            </div>
            <button
              onClick={() => handleRemove(skip.id)}
              className="rounded-md px-2 py-1 text-sm text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
