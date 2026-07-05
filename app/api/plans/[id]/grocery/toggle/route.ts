import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePlanAccess } from "@/lib/access";
import { normalizeItemKey } from "@/lib/grocery";
import { startOfWeek } from "@/lib/dates";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  // Both editor and viewer (the spouse's share link) can collaborate on groceries.
  const access = await resolvePlanAccess(id, body?.token ?? null);
  if (!access) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const weekStartParam = body?.weekStartDate;
  const itemName = body?.itemName;
  const checked = body?.checked;
  if (typeof weekStartParam !== "string" || !ISO_DATE.test(weekStartParam)) {
    return NextResponse.json({ error: "weekStartDate must be an ISO date." }, { status: 400 });
  }
  if (typeof itemName !== "string" || !itemName.trim()) {
    return NextResponse.json({ error: "itemName is required." }, { status: 400 });
  }
  if (typeof checked !== "boolean") {
    return NextResponse.json({ error: "checked must be a boolean." }, { status: 400 });
  }

  const weekStartDate = startOfWeek(weekStartParam);
  const itemKey = normalizeItemKey(itemName);

  const result = await prisma.groceryCheck.upsert({
    where: { mealPlanId_weekStartDate_itemKey: { mealPlanId: id, weekStartDate, itemKey } },
    create: { mealPlanId: id, weekStartDate, itemKey, checked },
    update: { checked },
  });

  return NextResponse.json(result);
}
