import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlanEditor from "@/components/PlanEditor";
import { PlanDTO } from "@/lib/types";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>;
}) {
  const { id, token } = await params;

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

  if (!plan || plan.editToken !== token) notFound();

  const dto: PlanDTO = {
    id: plan.id,
    name: plan.name,
    weeksCount: plan.weeksCount,
    startDate: plan.startDate,
    role: "editor",
    editToken: plan.editToken,
    shareToken: plan.shareToken,
    weeks: plan.weeks,
    skipPeriods: plan.skipPeriods,
  };

  return <PlanEditor initialPlan={dto} />;
}
