import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireApiUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, error: "Not authenticated" };
  }
  return { user: session.user, error: null };
}

/** Loads a project and verifies it belongs to the given user id. */
export async function requireOwnedProject(projectId: string, userId: string) {
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== userId) return null;
  return project;
}
