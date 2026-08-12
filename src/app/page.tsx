import Link from "next/link";

const FEATURES = [
  {
    title: "Prompt-to-texture generation",
    body: "Describe a block -- \"scorched obsidian bricks\", \"glowing crystal ore\" -- and get a deterministic, seeded 16x16 texture synthesized on the fly. No external API key required.",
    tag: "Image generation",
  },
  {
    title: "Photo-to-structure conversion",
    body: "Upload any photo. It's converted into a voxel relief sculpture: brightness becomes height, color is quantized to the nearest of 50+ real Minecraft blocks.",
    tag: "Image to asset",
  },
  {
    title: "Accounts and saved projects",
    body: "Email + password auth, a real database, and a project workspace that remembers every texture and structure you generate.",
    tag: "Auth / DB",
  },
  {
    title: "A datapack you can actually load",
    body: "Every project exports a real .zip: a datapack with a hand-written NBT structure file, plus a resource pack carrying your generated texture. Drop it in and /reload.",
    tag: "Usable output",
  },
];

const STEPS = [
  { n: "01", title: "Create a project", body: "Name it and describe a theme -- this seeds the whole run." },
  { n: "02", title: "Generate & upload", body: "Synthesize block textures from prompts, upload a photo to voxelize into a structure." },
  { n: "03", title: "Download & play", body: "Get a .zip with a datapack + resource pack. Drop into your world, /reload, done." },
];

export default function Home() {
  return (
    <div className="flex-1">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
          <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-300">
            single-type mod generator -- structures &amp; blueprint items
          </div>
          <h1 className="mt-6 font-mono text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl">
            Turn a prompt and a photo into a{" "}
            <span className="text-emerald-400">real Minecraft datapack</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            Blockforge generates block textures from text, converts your photos into placeable voxel
            structures, and packages both into a datapack + resource pack you can drop straight into a
            world. No modding toolchain required.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="bg-emerald-500 px-6 py-3 font-mono font-semibold text-black hover:bg-emerald-400 transition"
            >
              Start building &rarr;
            </Link>
            <Link
              href="/login"
              className="border border-white/20 px-6 py-3 font-mono text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-400">What you get</h2>
        <div className="mt-6 grid gap-px bg-white/10 sm:grid-cols-2 border border-white/10">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[var(--background)] p-6 sm:p-8">
              <span className="font-mono text-xs text-amber-400">{f.tag}</span>
              <h3 className="mt-2 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-white/65 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-400">How it works</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="font-mono text-3xl text-white/20">{s.n}</div>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-white/65 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <div className="border border-white/10 bg-white/[0.03] p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">Ready to forge something?</h2>
            <p className="mt-2 text-white/65">Free account, local-first, generates in seconds.</p>
          </div>
          <Link
            href="/signup"
            className="whitespace-nowrap bg-emerald-500 px-6 py-3 font-mono font-semibold text-black hover:bg-emerald-400 transition"
          >
            Create your first project
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-sm text-white/40 flex flex-col sm:flex-row justify-between gap-2">
          <span>Blockforge is an independent fan-made tool. Not affiliated with Mojang or Microsoft.</span>
          <span>Targets Minecraft Java Edition 1.20 - 1.20.4</span>
        </div>
      </footer>
    </div>
  );
}
