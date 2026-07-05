-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "weeksCount" INTEGER NOT NULL,
    "startDate" TEXT,
    "editToken" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Week" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mealPlanId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    CONSTRAINT "Week_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "mealName" TEXT,
    "recipeUrl" TEXT,
    "notes" TEXT,
    CONSTRAINT "MealSlot_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mealSlotId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Ingredient_mealSlotId_fkey" FOREIGN KEY ("mealSlotId") REFERENCES "MealSlot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SkipPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mealPlanId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SkipPeriod_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroceryCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mealPlanId" TEXT NOT NULL,
    "weekStartDate" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "GroceryCheck_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_editToken_key" ON "MealPlan"("editToken");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_shareToken_key" ON "MealPlan"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "Week_mealPlanId_weekNumber_key" ON "Week"("mealPlanId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MealSlot_weekId_dayOfWeek_key" ON "MealSlot"("weekId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "GroceryCheck_mealPlanId_weekStartDate_itemKey_key" ON "GroceryCheck"("mealPlanId", "weekStartDate", "itemKey");
