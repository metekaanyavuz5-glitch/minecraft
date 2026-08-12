import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiUser, requireOwnedProject } from "@/lib/authz";
import { buildStructureNbt } from "@/lib/structure";
import { assembleDatapackZip, sanitizeResourceName } from "@/lib/datapack";
import type { VoxelBlock } from "@/lib/voxelizer";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireApiUser();
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const { id } = await params;
  const project = await requireOwnedProject(id, user.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const [structures, textures] = await Promise.all([
    db.structureAsset.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "asc" } }),
    db.textureAsset.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" }, take: 1 }),
  ]);

  if (structures.length === 0) {
    return NextResponse.json(
      { error: "Upload at least one photo to generate a structure before downloading." },
      { status: 400 }
    );
  }

  const datapackStructures = structures.map((s) => {
    const blocks = JSON.parse(s.blockGridJson) as VoxelBlock[];
    const palette = JSON.parse(s.paletteJson) as string[];
    const nbt = buildStructureNbt({
      width: s.width,
      height: s.height,
      depth: s.depth,
      blocks,
      palette,
    });
    return { name: s.name, nbt };
  });

  const zip = await assembleDatapackZip({
    projectName: project.name,
    namespace: project.namespace,
    theme: project.theme,
    structures: datapackStructures,
    blueprintTexturePng: textures[0]?.pngData,
  });

  const filename = `${sanitizeResourceName(project.name)}-datapack.zip`;

  return new NextResponse(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
