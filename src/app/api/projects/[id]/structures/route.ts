import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiUser, requireOwnedProject } from "@/lib/authz";
import { voxelizeImage } from "@/lib/voxelizer";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireApiUser();
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const { id } = await params;
  const project = await requireOwnedProject(id, user.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("image");
  const name = form?.get("name");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  const structureName = typeof name === "string" && name.trim().length > 0 ? name.trim().slice(0, 40) : file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "structure";

  const buffer = Buffer.from(await file.arrayBuffer());
  const voxel = await voxelizeImage(buffer);

  const asset = await db.structureAsset.create({
    data: {
      projectId: project.id,
      name: structureName,
      sourceImage: file.name,
      width: voxel.width,
      height: voxel.height,
      depth: voxel.depth,
      blockGridJson: JSON.stringify(voxel.blocks),
      paletteJson: JSON.stringify(voxel.palette),
      previewPngData: new Uint8Array(voxel.previewPng),
    },
    select: { id: true, name: true, width: true, height: true, depth: true, createdAt: true },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
