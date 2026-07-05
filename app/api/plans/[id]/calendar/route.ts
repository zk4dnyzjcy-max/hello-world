import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePlanAccess } from "@/lib/access";
import { computeCalendar } from "@/lib/schedule";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");
  const access = await resolvePlanAccess(id, token);
  if (!access) return NextResponse.json({ error: "Not found or access denied." }, { status: 404 });

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  if (!from || !to || !ISO_DATE.test(from) || !ISO_DATE.test(to)) {
    return NextResponse.json({ error: "from and to must be ISO dates." }, { status: 400 });
  }

  const plan = await prisma.mealPlan.findUnique({
    where: { id },
    include: {
      skipPeriods: true,
      weeks: {
        include: { slots: { include: { ingredients: { orderBy: { sortOrder: "asc" } } } } },
      },
    },
  });
  if (!plan) return NextResponse.json({ error: "Not found." }, { status: 404 });

  let entries;
  try {
    entries = computeCalendar(plan.startDate, plan.weeksCount * 7, plan.skipPeriods, from, to);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const slotByKey = new Map<string, (typeof plan.weeks)[number]["slots"][number]>(
    plan.weeks.flatMap((w) => w.slots.map((s) => [`${w.weekNumber}:${s.dayOfWeek}`, s]))
  );

  const results = entries.map((entry) => {
    const key = entry.weekNumber != null ? `${entry.weekNumber}:${entry.dayOfWeek}` : null;
    return { ...entry, slot: key ? slotByKey.get(key) ?? null : null };
  });

  return NextResponse.json(results);
}
