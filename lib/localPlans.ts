"use client";

export interface RecentPlan {
  id: string;
  name: string;
  role: "editor" | "viewer";
  token: string;
  createdAt: string;
}

const STORAGE_KEY = "meal-planner:recent-plans";
const listeners = new Set<() => void>();

// useSyncExternalStore requires getSnapshot to return a stable reference when
// nothing has changed, so we cache the parsed array instead of re-parsing
// localStorage (and allocating a new array) on every call.
let cache: RecentPlan[] | null = null;

function readFromStorage(): RecentPlan[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function notify() {
  for (const listener of listeners) listener();
}

export function subscribeRecentPlans(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getRecentPlans(): RecentPlan[] {
  if (typeof window === "undefined") return [];
  if (cache === null) cache = readFromStorage();
  return cache;
}

function writeAndNotify(next: RecentPlan[]) {
  cache = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notify();
}

export function saveRecentPlan(plan: RecentPlan) {
  if (typeof window === "undefined") return;
  const existing = getRecentPlans().filter((p) => !(p.id === plan.id && p.role === plan.role));
  writeAndNotify([plan, ...existing].slice(0, 20));
}

export function removeRecentPlan(id: string, role: RecentPlan["role"]) {
  if (typeof window === "undefined") return;
  writeAndNotify(getRecentPlans().filter((p) => !(p.id === id && p.role === role)));
}
