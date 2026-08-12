import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiUser } from "@/lib/authz";
import { projectSchema } from "@/lib/validation";
import { sanitizeResourceName } from "@/lib/datapack";

export async function POST(request: Request) {
  const { user, error } = await requireApiUser();
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, theme } = parsed.data;
  const namespace = `${sanitizeResourceName(name)}_${Math.random().toString(36).slice(2, 7)}`;

  const project = await db.project.create({
    data: { userId: user.id, name, theme, namespace },
  });

  return NextResponse.json({ project }, { status: 201 });
}
