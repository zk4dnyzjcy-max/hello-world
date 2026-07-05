"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getRecentPlans, removeRecentPlan, subscribeRecentPlans } from "@/lib/localPlans";

const EMPTY: ReturnType<typeof getRecentPlans> = [];

export default function RecentPlans() {
  const plans = useSyncExternalStore(subscribeRecentPlans, getRecentPlans, () => EMPTY);

  if (plans.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-stone-500 dark:text-stone-400">
        Your meal plans on this device
      </h2>
      <ul className="flex flex-col gap-2">
        {plans.map((plan) => (
          <li
            key={`${plan.id}-${plan.role}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-stone-900 dark:text-stone-100">{plan.name}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {plan.role === "editor" ? "Owner" : "Shared with you"} &middot;{" "}
                {new Date(plan.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/plan/${plan.id}/${plan.role === "editor" ? "edit" : "view"}/${plan.token}`}
                className="rounded-md bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900"
              >
                Open
              </Link>
              <button
                onClick={() => removeRecentPlan(plan.id, plan.role)}
                className="rounded-md px-2 py-1.5 text-sm text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
                aria-label={`Remove ${plan.name} from this list`}
              >
                &times;
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
