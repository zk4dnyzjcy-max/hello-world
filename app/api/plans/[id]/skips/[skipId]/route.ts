import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePlanAccess } from "@/lib/access";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; skipId: string }> }
) {
  const { id, skipId } = await params;
  const token = req.nextUrl.searchParams.get("token");
  const access = await resolvePlanAccess(id, token);
  if (!access || access.role !== "editor") {
    return NextResponse.json({ error: "Edit access required." }, { status: 403 });
  }

  await prisma.skipPeriod.deleteMany({ where: { id: skipId, mealPlanId: id } });
  return NextResponse.json({ ok: true });
}
