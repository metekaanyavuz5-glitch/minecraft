import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiUser, requireOwnedProject } from "@/lib/authz";
import { generateTexture } from "@/lib/textureGen";

const bodySchema = z.object({
  blockName: z.string().trim().min(2).max(40),
  prompt: z.string().trim().min(2).max(200),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireApiUser();
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const { id } = await params;
  const project = await requireOwnedProject(id, user.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { blockName, prompt } = parsed.data;
  const { png, seed, palette } = await generateTexture(`${prompt} ${blockName}`);

  const asset = await db.textureAsset.create({
    data: {
      projectId: project.id,
      blockName,
      prompt,
      seed,
      paletteJson: JSON.stringify(palette),
      pngData: new Uint8Array(png),
    },
    select: { id: true, blockName: true, prompt: true, createdAt: true },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
