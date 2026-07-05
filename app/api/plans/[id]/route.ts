import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePlanAccess } from "@/lib/access";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");
  const access = await resolvePlanAccess(id, token);
  if (!access) return NextResponse.json({ error: "Not found or access denied." }, { status: 404 });

  const plan = await prisma.mealPlan.findUnique({
    where: { id },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          slots: {
            orderBy: { dayOfWeek: "asc" },
            include: { ingredients: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
      skipPeriods: { orderBy: { startDate: "asc" } },
    },
  });
  if (!plan) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({
    id: plan.id,
    name: plan.name,
    weeksCount: plan.weeksCount,
    startDate: plan.startDate,
    role: access.role,
    editToken: access.role === "editor" ? plan.editToken : undefined,
    shareToken: plan.shareToken,
    weeks: plan.weeks,
    skipPeriods: plan.skipPeriods,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const access = await resolvePlanAccess(id, body?.token ?? null);
  if (!access || access.role !== "editor") {
    return NextResponse.json({ error: "Edit access required." }, { status: 403 });
  }

  const data: { name?: string; startDate?: string | null; weeksCount?: number } = {};

  if (typeof body?.name === "string" && body.name.trim()) {
    data.name = body.name.trim();
  }

  if ("startDate" in body) {
    if (body.startDate === null) {
      data.startDate = null;
    } else if (typeof body.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.startDate)) {
      data.startDate = body.startDate;
    } else {
      return NextResponse.json({ error: "startDate must be an ISO date or null." }, { status: 400 });
    }
  }

  if ("weeksCount" in body) {
    const weeksCount = Number(body.weeksCount);
    if (!Number.isInteger(weeksCount) || weeksCount < 1 || weeksCount > 52) {
      return NextResponse.json(
        { error: "Number of weeks must be an integer between 1 and 52." },
        { status: 400 }
      );
    }

    const current = await prisma.mealPlan.findUnique({
      where: { id },
      select: { weeksCount: true },
    });
    if (current && weeksCount !== current.weeksCount) {
      if (weeksCount > current.weeksCount) {
        await prisma.week.createMany({
          data: Array.from(
            { length: weeksCount - current.weeksCount },
            (_, i) => ({ mealPlanId: id, weekNumber: current.weeksCount + i + 1 })
          ),
        });
        const newWeeks = await prisma.week.findMany({
          where: { mealPlanId: id, weekNumber: { gt: current.weeksCount } },
          select: { id: true },
        });
        await prisma.mealSlot.createMany({
          data: newWeeks.flatMap((w) =>
            Array.from({ length: 7 }, (_, dayOfWeek) => ({ weekId: w.id, dayOfWeek }))
          ),
        });
      } else {
        await prisma.week.deleteMany({
          where: { mealPlanId: id, weekNumber: { gt: weeksCount } },
        });
      }
    }
    data.weeksCount = weeksCount;
  }

  const plan = await prisma.mealPlan.update({ where: { id }, data });
  return NextResponse.json({ id: plan.id, name: plan.name, weeksCount: plan.weeksCount, startDate: plan.startDate });
}
