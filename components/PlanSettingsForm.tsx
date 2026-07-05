"use client";

import { useState } from "react";
import { todayISO } from "@/lib/dates";

interface Props {
  planId: string;
  token: string;
  name: string;
  weeksCount: number;
  startDate: string | null;
  onSaved: (patch: { name: string; weeksCount: number; startDate: string | null }) => void;
}

export default function PlanSettingsForm({ planId, token, name, weeksCount, startDate, onSaved }: Props) {
  const [form, setForm] = useState({
    name,
    weeksCount,
    startDate: startDate ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: form.name,
          weeksCount: form.weeksCount,
          startDate: form.startDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      onSaved({ name: data.name, weeksCount: data.weeksCount, startDate: data.startDate });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const shrinking = form.weeksCount < weeksCount;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Plan settings</h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Plan name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Number of weeks</label>
        <input
          type="number"
          min={1}
          max={52}
          value={form.weeksCount}
          onChange={(e) => setForm((f) => ({ ...f, weeksCount: Number(e.target.value) }))}
          className="w-32 rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
        {shrinking && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Shrinking the rotation permanently deletes the meals in the removed weeks.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Start date</label>
        <input
          type="date"
          value={form.startDate}
          min={undefined}
          onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          className="w-48 rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
        <div className="flex gap-3 text-xs">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, startDate: todayISO() }))}
            className="font-medium text-orange-700 hover:underline dark:text-orange-400"
          >
            Start today
          </button>
          {form.startDate && (
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, startDate: "" }))}
              className="font-medium text-stone-500 hover:underline dark:text-stone-400"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          The rotation&apos;s Monday of week 1 will land on this date. Everything before it has no meal
          scheduled.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
        {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved</span>}
      </div>
    </form>
  );
}
