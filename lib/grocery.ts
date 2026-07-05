import { addISODays } from "./dates";
import { computeCalendar, SkipPeriodInput } from "./schedule";

export interface IngredientData {
  name: string;
}

export interface MealSlotData {
  dayOfWeek: number;
  mealName: string | null;
  ingredients: IngredientData[];
}

export interface WeekData {
  weekNumber: number;
  slots: MealSlotData[];
}

export interface GroceryCheckData {
  itemKey: string;
  checked: boolean;
}

export interface GroceryItem {
  itemKey: string;
  name: string;
  checked: boolean;
  /** Meals this week that call for the ingredient, e.g. "Taco Tuesday". */
  neededFor: string[];
}

export interface GroceryListResult {
  weekStartDate: string;
  weekEndDate: string;
  items: GroceryItem[];
  /** Dates in this week with no meal assigned (rotation hasn't started, or skipped). */
  daysWithoutMeals: { date: string; skipped: boolean; skipReason?: string | null }[];
}

export function normalizeItemKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function computeGroceryList(
  startDate: string | null,
  totalDays: number,
  skips: SkipPeriodInput[],
  weeks: WeekData[],
  checks: GroceryCheckData[],
  weekStartDate: string
): GroceryListResult {
  const weekEndDate = addISODays(weekStartDate, 6);
  const entries = computeCalendar(startDate, totalDays, skips, weekStartDate, weekEndDate);

  const slotByKey = new Map<string, MealSlotData>();
  for (const week of weeks) {
    for (const slot of week.slots) {
      slotByKey.set(`${week.weekNumber}:${slot.dayOfWeek}`, slot);
    }
  }

  const checkedByKey = new Map(checks.map((c) => [c.itemKey, c.checked]));

  const items = new Map<string, GroceryItem>();
  const daysWithoutMeals: GroceryListResult["daysWithoutMeals"] = [];

  for (const entry of entries) {
    if (entry.skipped) {
      daysWithoutMeals.push({ date: entry.date, skipped: true, skipReason: entry.skipReason });
      continue;
    }
    const slot = slotByKey.get(`${entry.weekNumber}:${entry.dayOfWeek}`);
    if (!slot || (!slot.mealName && slot.ingredients.length === 0)) {
      daysWithoutMeals.push({ date: entry.date, skipped: false });
      continue;
    }
    for (const ingredient of slot.ingredients) {
      const key = normalizeItemKey(ingredient.name);
      if (!key) continue;
      const existing = items.get(key);
      const mealLabel = slot.mealName?.trim() || "Untitled meal";
      if (existing) {
        if (!existing.neededFor.includes(mealLabel)) existing.neededFor.push(mealLabel);
      } else {
        items.set(key, {
          itemKey: key,
          name: ingredient.name.trim(),
          checked: checkedByKey.get(key) ?? false,
          neededFor: [mealLabel],
        });
      }
    }
  }

  return {
    weekStartDate,
    weekEndDate,
    items: Array.from(items.values()).sort((a, b) => a.name.localeCompare(b.name)),
    daysWithoutMeals,
  };
}
