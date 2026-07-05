"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DAY_NAMES } from "@/lib/dates";
import { saveRecentPlan } from "@/lib/localPlans";
import { MealSlotDTO, PlanDTO, SkipPeriodDTO } from "@/lib/types";
import DaySlotForm from "./DaySlotForm";
import PlanSettingsForm from "./PlanSettingsForm";
import ShareLinks from "./ShareLinks";
import SkipManager from "./SkipManager";

type Tab = "rotation" | "skips" | "sharing";

export default function PlanEditor({ initialPlan }: { initialPlan: PlanDTO }) {
  const [plan, setPlan] = useState(initialPlan);
  const [tab, setTab] = useState<Tab>("rotation");
  const [weekNumber, setWeekNumber] = useState(1);
  const [dayOfWeek, setDayOfWeek] = useState(0);

  const token = plan.editToken!;

  useEffect(() => {
    saveRecentPlan({
      id: plan.id,
      name: plan.name,
      role: "editor",
      token,
      createdAt: new Date().toISOString(),
    });
    // Only re-run when the plan name changes, so we keep the recent-plans list fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.name]);

  // Clamp during render instead of syncing via effect, so shrinking the rotation
  // never leaves the selector pointing at a week that no longer exists.
  const selectedWeek = Math.min(weekNumber, plan.weeksCount);

  const currentWeek = plan.weeks.find((w) => w.weekNumber === selectedWeek);
  const currentSlot = currentWeek?.slots.find((s) => s.dayOfWeek === dayOfWeek);

  function handleSlotSaved(slot: MealSlotDTO) {
    setPlan((p) => ({
      ...p,
      weeks: p.weeks.map((w) =>
        w.weekNumber === selectedWeek
          ? { ...w, slots: w.slots.some((s) => s.dayOfWeek === dayOfWeek) ? w.slots.map((s) => (s.dayOfWeek === dayOfWeek ? slot : s)) : [...w.slots, slot] }
          : w
      ),
    }));
  }

  function handleSkipsChanged(skipPeriods: SkipPeriodDTO[]) {
    setPlan((p) => ({ ...p, skipPeriods }));
  }

  function handleSettingsSaved(patch: { name: string; weeksCount: number; startDate: string | null }) {
    setPlan((p) => {
      let weeks = p.weeks;
      if (patch.weeksCount > p.weeksCount) {
        const added = Array.from({ length: patch.weeksCount - p.weeksCount }, (_, i) => ({
          id: `pending-${p.weeksCount + i + 1}`,
          weekNumber: p.weeksCount + i + 1,
          slots: [],
        }));
        weeks = [...weeks, ...added];
      } else if (patch.weeksCount < p.weeksCount) {
        weeks = weeks.filter((w) => w.weekNumber <= patch.weeksCount);
      }
      return { ...p, ...patch, weeks };
    });
  }

  const weekNumbers = useMemo(() => Array.from({ length: plan.weeksCount }, (_, i) => i + 1), [plan.weeksCount]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-stone-500 hover:underline dark:text-stone-400">
            &larr; Home
          </Link>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">{plan.name}</h1>
        </div>
        <Link
          href={`/plan/${plan.id}/view/${token}`}
          className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          View calendar
        </Link>
      </div>

      <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-900">
        {(
          [
            ["rotation", "Rotation"],
            ["skips", "Skip Days & Weeks"],
            ["sharing", "Sharing & Settings"],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              tab === value
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100"
                : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "rotation" && (
        <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-wrap gap-1.5">
            {weekNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setWeekNumber(n)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  selectedWeek === n
                    ? "bg-orange-600 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                }`}
              >
                Week {n}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-stone-100 pt-4 dark:border-stone-800">
            {DAY_NAMES.map((label, index) => {
              const hasMeal = currentWeek?.slots.find((s) => s.dayOfWeek === index)?.mealName;
              return (
                <button
                  key={label}
                  onClick={() => setDayOfWeek(index)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    dayOfWeek === index
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  }`}
                >
                  {label.slice(0, 3)}
                  {hasMeal ? " •" : ""}
                </button>
              );
            })}
          </div>

          <div className="border-t border-stone-100 pt-4 dark:border-stone-800">
            <DaySlotForm
              key={`${selectedWeek}-${dayOfWeek}`}
              planId={plan.id}
              token={token}
              weekNumber={selectedWeek}
              slot={currentSlot ?? { id: "", dayOfWeek, mealName: null, recipeUrl: null, notes: null, ingredients: [] }}
              dayLabel={DAY_NAMES[dayOfWeek]}
              onSaved={handleSlotSaved}
            />
          </div>
        </div>
      )}

      {tab === "skips" && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <SkipManager planId={plan.id} token={token} skipPeriods={plan.skipPeriods} onChange={handleSkipsChanged} />
        </div>
      )}

      {tab === "sharing" && (
        <div className="flex flex-col gap-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <ShareLinks planId={plan.id} editToken={plan.editToken} shareToken={plan.shareToken} />
          <div className="border-t border-stone-100 pt-6 dark:border-stone-800">
            <PlanSettingsForm
              planId={plan.id}
              token={token}
              name={plan.name}
              weeksCount={plan.weeksCount}
              startDate={plan.startDate}
              onSaved={handleSettingsSaved}
            />
          </div>
        </div>
      )}
    </div>
  );
}
