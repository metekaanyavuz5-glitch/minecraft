import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiUser } from "@/lib/authz";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireApiUser();
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const { id } = await params;
  const asset = await db.structureAsset.findUnique({
    where: { id },
    include: { project: { select: { userId: true } } },
  });
  if (!asset || asset.project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(asset.previewPngData), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
