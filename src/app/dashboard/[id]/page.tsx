import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TextureGeneratorForm } from "@/components/TextureGeneratorForm";
import { StructureUploadForm } from "@/components/StructureUploadForm";

export default async function ProjectPage({ params }: PageProps<"/dashboard/[id]">) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      textures: { orderBy: { createdAt: "desc" } },
      structures: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project || project.userId !== userId) notFound();

  return (
    <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-12">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-mono text-2xl font-bold">{project.name}</h1>
          <p className="mt-1 text-white/60 max-w-2xl">{project.theme}</p>
          <p className="mt-2 text-xs font-mono text-white/30">namespace: {project.namespace}</p>
        </div>
        <a
          href={`/api/projects/${project.id}/download`}
          className="whitespace-nowrap bg-emerald-500 px-4 py-2 font-mono font-semibold text-black hover:bg-emerald-400 transition"
        >
          Download datapack .zip
        </a>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="border border-white/10 bg-white/[0.02] p-6">
          <h2 className="font-mono text-sm uppercase tracking-widest text-amber-400">Textures</h2>
          <p className="mt-1 text-sm text-white/50">
            The most recent texture becomes the blueprint item skin in your resource pack.
          </p>
          <div className="mt-4">
            <TextureGeneratorForm projectId={project.id} defaultPrompt={project.theme} />
          </div>

          {project.textures.length > 0 && (
            <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {project.textures.map((t) => (
                <div key={t.id} className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/textures/${t.id}/image`}
                    alt={t.blockName}
                    width={64}
                    height={64}
                    className="pixelated w-full aspect-square border border-white/10 bg-black/30"
                  />
                  <p className="mt-1 text-xs text-white/50 truncate">{t.blockName}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="border border-white/10 bg-white/[0.02] p-6">
          <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-400">Structures</h2>
          <p className="mt-1 text-sm text-white/50">Every structure ships in the datapack as a placeable template.</p>
          <div className="mt-4">
            <StructureUploadForm projectId={project.id} />
          </div>

          {project.structures.length > 0 && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {project.structures.map((s) => (
                <div key={s.id} className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/structures/${s.id}/image`}
                    alt={s.name}
                    width={96}
                    height={96}
                    className="pixelated w-full aspect-square border border-white/10 bg-black/30"
                  />
                  <p className="mt-1 text-xs text-white/50 truncate">{s.name}</p>
                  <p className="text-[10px] font-mono text-white/30">
                    {s.width}x{s.height}x{s.depth}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
