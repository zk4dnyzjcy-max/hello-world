import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePlanAccess } from "@/lib/access";
import { computeGroceryList } from "@/lib/grocery";
import { startOfWeek } from "@/lib/dates";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");
  const access = await resolvePlanAccess(id, token);
  if (!access) return NextResponse.json({ error: "Not found or access denied." }, { status: 404 });

  const weekStartParam = req.nextUrl.searchParams.get("weekStart");
  if (!weekStartParam || !ISO_DATE.test(weekStartParam)) {
    return NextResponse.json({ error: "weekStart must be an ISO date." }, { status: 400 });
  }
  const weekStartDate = startOfWeek(weekStartParam);

  const plan = await prisma.mealPlan.findUnique({
    where: { id },
    include: {
      skipPeriods: true,
      weeks: { include: { slots: { include: { ingredients: true } } } },
      groceryChecks: { where: { weekStartDate } },
    },
  });
  if (!plan) return NextResponse.json({ error: "Not found." }, { status: 404 });

  let result;
  try {
    result = computeGroceryList(
      plan.startDate,
      plan.weeksCount * 7,
      plan.skipPeriods,
      plan.weeks,
      plan.groceryChecks,
      weekStartDate
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  return NextResponse.json(result);
}
