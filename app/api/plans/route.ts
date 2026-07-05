import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const weeksCount = Number(body?.weeksCount);

  if (!name) {
    return NextResponse.json({ error: "Plan name is required." }, { status: 400 });
  }
  if (!Number.isInteger(weeksCount) || weeksCount < 1 || weeksCount > 52) {
    return NextResponse.json(
      { error: "Number of weeks must be an integer between 1 and 52." },
      { status: 400 }
    );
  }

  try {
    const plan = await prisma.mealPlan.create({
      data: {
        name,
        weeksCount,
        editToken: generateToken(),
        shareToken: generateToken(),
        weeks: {
          create: Array.from({ length: weeksCount }, (_, i) => ({
            weekNumber: i + 1,
            slots: {
              create: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek })),
            },
          })),
        },
      },
    });

    return NextResponse.json({
      id: plan.id,
      editToken: plan.editToken,
      shareToken: plan.shareToken,
    });
  } catch (err) {
    console.error("Failed to create plan:", err);
    return NextResponse.json(
      {
        error:
          "Could not reach the database. Make sure DATABASE_URL is set for this deployment and the tables have been created.",
      },
      { status: 500 }
    );
  }
}
