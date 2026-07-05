import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlanViewer from "@/components/PlanViewer";

export default async function ViewPlanPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>;
}) {
  const { id, token } = await params;

  const plan = await prisma.mealPlan.findUnique({
    where: { id },
    select: { id: true, name: true, editToken: true, shareToken: true },
  });

  if (!plan) notFound();
  const role: "editor" | "viewer" | null =
    token === plan.editToken ? "editor" : token === plan.shareToken ? "viewer" : null;
  if (!role) notFound();

  return <PlanViewer planId={plan.id} planName={plan.name} token={token} role={role} />;
}
