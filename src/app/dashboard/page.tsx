import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const projects = await db.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { textures: true, structures: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-mono text-2xl font-bold">Your projects</h1>
          <p className="mt-1 text-white/60">Every project bundles its own textures and structures.</p>
        </div>
        <Link
          href="/dashboard/new"
          className="bg-emerald-500 px-4 py-2 font-mono font-semibold text-black hover:bg-emerald-400 transition"
        >
          + New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-12 border border-dashed border-white/15 p-12 text-center text-white/50">
          No projects yet. Create one to generate your first texture or structure.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/${p.id}`}
              className="block border border-white/10 bg-white/[0.02] p-5 hover:border-emerald-500/50 hover:bg-white/[0.04] transition"
            >
              <h2 className="font-semibold text-lg">{p.name}</h2>
              <p className="mt-1 text-sm text-white/60 line-clamp-2">{p.theme}</p>
              <div className="mt-4 flex gap-4 text-xs font-mono text-white/40">
                <span>{p._count.textures} textures</span>
                <span>{p._count.structures} structures</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
