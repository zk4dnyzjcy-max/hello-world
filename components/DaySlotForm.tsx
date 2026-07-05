"use client";

import { useState } from "react";
import { MealSlotDTO } from "@/lib/types";

interface Props {
  planId: string;
  token: string;
  weekNumber: number;
  slot: MealSlotDTO | undefined;
  dayLabel: string;
  onSaved: (slot: MealSlotDTO) => void;
}

function slotToForm(slot: MealSlotDTO | undefined) {
  return {
    mealName: slot?.mealName ?? "",
    recipeUrl: slot?.recipeUrl ?? "",
    notes: slot?.notes ?? "",
    ingredients: slot?.ingredients.length ? slot.ingredients.map((i) => i.name) : [""],
  };
}

export default function DaySlotForm({ planId, token, weekNumber, slot, dayLabel, onSaved }: Props) {
  const [form, setForm] = useState(() => slotToForm(slot));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateIngredient(index: number, value: string) {
    setForm((f) => ({ ...f, ingredients: f.ingredients.map((v, i) => (i === index ? value : v)) }));
  }

  function addIngredient() {
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, ""] }));
  }

  function removeIngredient(index: number) {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== index) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${planId}/slots`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          weekNumber,
          dayOfWeek: slot?.dayOfWeek,
          mealName: form.mealName,
          recipeUrl: form.recipeUrl,
          notes: form.notes,
          ingredients: form.ingredients.filter((s) => s.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      onSaved(data);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        Week {weekNumber} &middot; {dayLabel}
      </h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Meal name</label>
        <input
          type="text"
          value={form.mealName}
          onChange={(e) => setForm((f) => ({ ...f, mealName: e.target.value }))}
          placeholder="e.g. Taco Tuesday"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Recipe link</label>
        <input
          type="url"
          value={form.recipeUrl}
          onChange={(e) => setForm((f) => ({ ...f, recipeUrl: e.target.value }))}
          placeholder="https://..."
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Ingredients</label>
        <div className="flex flex-col gap-2">
          {form.ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder="e.g. Ground beef"
                className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="rounded-lg px-3 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
                aria-label="Remove ingredient"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-1 self-start rounded-md px-2 py-1 text-sm font-medium text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950"
        >
          + Add ingredient
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="e.g. Marinate chicken the night before"
          rows={3}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save day"}
        </button>
        {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved</span>}
      </div>
    </form>
  );
}
