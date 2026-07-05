import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePlanAccess } from "@/lib/access";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");
  const access = await resolvePlanAccess(id, token);
  if (!access) return NextResponse.json({ error: "Not found or access denied." }, { status: 404 });

  const skips = await prisma.skipPeriod.findMany({
    where: { mealPlanId: id },
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json(skips);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const access = await resolvePlanAccess(id, body?.token ?? null);
  if (!access || access.role !== "editor") {
    return NextResponse.json({ error: "Edit access required." }, { status: 403 });
  }

  const startDate = body?.startDate;
  const endDate = body?.endDate;
  if (typeof startDate !== "string" || !ISO_DATE.test(startDate)) {
    return NextResponse.json({ error: "startDate must be an ISO date." }, { status: 400 });
  }
  if (typeof endDate !== "string" || !ISO_DATE.test(endDate)) {
    return NextResponse.json({ error: "endDate must be an ISO date." }, { status: 400 });
  }
  if (endDate < startDate) {
    return NextResponse.json({ error: "endDate must be on or after startDate." }, { status: 400 });
  }
  const reason = typeof body?.reason === "string" ? body.reason.trim() || null : null;

  const skip = await prisma.skipPeriod.create({
    data: { mealPlanId: id, startDate, endDate, reason },
  });
  return NextResponse.json(skip);
}
