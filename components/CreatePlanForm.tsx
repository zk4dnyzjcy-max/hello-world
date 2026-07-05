"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveRecentPlan } from "@/lib/localPlans";

export default function CreatePlanForm() {
  const router = useRouter();
  const [name, setName] = useState("Our Meal Rotation");
  const [weeksCount, setWeeksCount] = useState(8);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, weeksCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      saveRecentPlan({
        id: data.id,
        name,
        role: "editor",
        token: data.editToken,
        createdAt: new Date().toISOString(),
      });
      router.push(`/plan/${data.id}/edit/${data.editToken}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Plan name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          placeholder="Our Meal Rotation"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="weeksCount" className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Number of weeks in the rotation
        </label>
        <input
          id="weeksCount"
          type="number"
          min={1}
          max={52}
          required
          value={weeksCount}
          onChange={(e) => setWeeksCount(Number(e.target.value))}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Once it&apos;s full, the rotation repeats automatically &mdash; you&apos;ll never have to remember which week you&apos;re on.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-lg bg-orange-600 px-4 py-2.5 font-medium text-white transition hover:bg-orange-700 disabled:opacity-60"
      >
        {submitting ? "Creating..." : "Create meal plan"}
      </button>
    </form>
  );
}
