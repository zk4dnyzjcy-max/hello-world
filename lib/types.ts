export interface IngredientDTO {
  id: string;
  name: string;
  sortOrder: number;
}

export interface MealSlotDTO {
  id: string;
  dayOfWeek: number;
  mealName: string | null;
  recipeUrl: string | null;
  notes: string | null;
  ingredients: IngredientDTO[];
}

export interface WeekDTO {
  id: string;
  weekNumber: number;
  slots: MealSlotDTO[];
}

export interface SkipPeriodDTO {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}

export interface PlanDTO {
  id: string;
  name: string;
  weeksCount: number;
  startDate: string | null;
  role: "editor" | "viewer";
  editToken?: string;
  shareToken: string;
  weeks: WeekDTO[];
  skipPeriods: SkipPeriodDTO[];
}

export interface CalendarEntryDTO {
  date: string;
  skipped: boolean;
  skipReason?: string | null;
  weekNumber?: number;
  dayOfWeek?: number;
  slot: MealSlotDTO | null;
}

export interface GroceryItemDTO {
  itemKey: string;
  name: string;
  checked: boolean;
  neededFor: string[];
}

export interface GroceryListDTO {
  weekStartDate: string;
  weekEndDate: string;
  items: GroceryItemDTO[];
  daysWithoutMeals: { date: string; skipped: boolean; skipReason?: string | null }[];
}
