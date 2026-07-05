import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePlanAccess } from "@/lib/access";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const access = await resolvePlanAccess(id, body?.token ?? null);
  if (!access || access.role !== "editor") {
    return NextResponse.json({ error: "Edit access required." }, { status: 403 });
  }

  const weekNumber = Number(body?.weekNumber);
  const dayOfWeek = Number(body?.dayOfWeek);
  if (!Number.isInteger(weekNumber) || weekNumber < 1) {
    return NextResponse.json({ error: "Invalid weekNumber." }, { status: 400 });
  }
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return NextResponse.json({ error: "Invalid dayOfWeek." }, { status: 400 });
  }

  const week = await prisma.week.findUnique({
    where: { mealPlanId_weekNumber: { mealPlanId: id, weekNumber } },
  });
  if (!week) return NextResponse.json({ error: "Week not found." }, { status: 404 });

  const mealName = typeof body?.mealName === "string" ? body.mealName.trim() || null : null;
  const recipeUrl = typeof body?.recipeUrl === "string" ? body.recipeUrl.trim() || null : null;
  const notes = typeof body?.notes === "string" ? body.notes.trim() || null : null;
  const ingredients: string[] = Array.isArray(body?.ingredients)
    ? body.ingredients.filter((s: unknown) => typeof s === "string" && s.trim()).map((s: string) => s.trim())
    : [];

  const slot = await prisma.mealSlot.upsert({
    where: { weekId_dayOfWeek: { weekId: week.id, dayOfWeek } },
    create: {
      weekId: week.id,
      dayOfWeek,
      mealName,
      recipeUrl,
      notes,
      ingredients: { create: ingredients.map((name, sortOrder) => ({ name, sortOrder })) },
    },
    update: {
      mealName,
      recipeUrl,
      notes,
      ingredients: {
        deleteMany: {},
        create: ingredients.map((name, sortOrder) => ({ name, sortOrder })),
      },
    },
    include: { ingredients: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(slot);
}
