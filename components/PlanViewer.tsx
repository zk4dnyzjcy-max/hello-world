"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { saveRecentPlan } from "@/lib/localPlans";
import CalendarView from "./CalendarView";
import GroceryList from "./GroceryList";

type Tab = "calendar" | "grocery";

export default function PlanViewer({
  planId,
  planName,
  token,
  role,
}: {
  planId: string;
  planName: string;
  token: string;
  role: "editor" | "viewer";
}) {
  const [tab, setTab] = useState<Tab>("calendar");

  useEffect(() => {
    if (role !== "viewer") return;
    saveRecentPlan({
      id: planId,
      name: planName,
      role: "viewer",
      token,
      createdAt: new Date().toISOString(),
    });
  }, [planId, planName, token, role]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          {role === "editor" && (
            <Link href={`/plan/${planId}/edit/${token}`} className="text-sm text-stone-500 hover:underline dark:text-stone-400">
              &larr; Back to editor
            </Link>
          )}
          {role === "viewer" && (
            <Link href="/" className="text-sm text-stone-500 hover:underline dark:text-stone-400">
              &larr; Home
            </Link>
          )}
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">{planName}</h1>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-900">
        {(
          [
            ["calendar", "Calendar"],
            ["grocery", "Grocery List"],
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

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        {tab === "calendar" ? (
          <CalendarView planId={planId} token={token} />
        ) : (
          <GroceryList planId={planId} token={token} />
        )}
      </div>
    </div>
  );
}
