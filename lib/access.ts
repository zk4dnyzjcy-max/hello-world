import { prisma } from "./prisma";

export type PlanRole = "editor" | "viewer";

/**
 * Capability-based access control: no accounts, just possession of the right
 * token. editToken can edit the rotation; shareToken is read-only + grocery
 * collaboration only.
 */
export async function resolvePlanAccess(
  planId: string,
  token: string | null
): Promise<{ role: PlanRole } | null> {
  if (!token) return null;
  const plan = await prisma.mealPlan.findUnique({
    where: { id: planId },
    select: { editToken: true, shareToken: true },
  });
  if (!plan) return null;
  if (token === plan.editToken) return { role: "editor" };
  if (token === plan.shareToken) return { role: "viewer" };
  return null;
}
