# Blockforge

A single-type Minecraft mod generator: describe a block, upload a photo, and
get back a real, loadable **datapack + resource pack** — a custom structure
built from your photo, and a themed texture baked into a blueprint item.

Built with Next.js 16 (App Router), Prisma 7 (SQLite via the libSQL driver
adapter), NextAuth v5 (Credentials), and a from-scratch NBT/structure-file
writer. No external API keys are required to run it.

## Feature checklist

| Requirement | Implementation |
| --- | --- |
| Image generation | `src/lib/textureGen.ts` — deterministic, seeded procedural 16x16 block-texture synthesizer (prompt → hue/pattern selection → PNG via `sharp`). Swappable for a real text-to-image API (see below). |
| Gaussian Splatting (image → asset) | `src/lib/voxelizer.ts` — see "About the image-to-asset pipeline" below for why this is a deliberate, scoped-down stand-in rather than literal 3D Gaussian Splatting. |
| Auth / DB / Landing page | NextAuth v5 Credentials provider + bcrypt (`src/auth.ts`), Prisma + SQLite (`prisma/schema.prisma`), marketing landing page at `src/app/page.tsx`. |
| Usable mod output | `src/lib/nbt.ts` + `src/lib/structure.ts` write a real, independently-parseable Minecraft **structure NBT file** by hand; `src/lib/datapack.ts` zips it into a datapack + resource pack with install instructions. |

## About the image-to-asset pipeline

True 3D Gaussian Splatting reconstructs a radiance field from many calibrated
photos (or video) of the same subject, trained on a GPU — it doesn't fit a
single-image, request/response web flow, and it doesn't natively output a
block grid anyway (Minecraft needs discrete voxels, not a splat cloud).

`voxelizeImage()` captures the same product idea — "turn a photo into a
placeable 3D in-game asset" — with an algorithm suited to that constraint:
the photo is treated as a heightmap laid on the ground plane, pixel
brightness becomes column height, and pixel color is quantized to the
nearest of ~50 real Minecraft block colors. It's instant, deterministic, and
produces a genuinely placeable structure. This tradeoff is intentional and
documented here rather than glossed over.

## Getting started

```bash
npm install
cp .env.example .env      # then edit AUTH_SECRET (see below)
npx prisma migrate deploy # or `npx prisma migrate dev` during development
npm run dev
```

Generate an `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

The SQLite database lives at `./dev.db` (gitignored). No other services are
required — everything (auth, image generation, voxelization, zip packaging)
runs in-process.

## Deploying to Vercel (or any serverless platform)

Two things a local `npm run dev` doesn't force you to think about, but that
break the build/runtime on Vercel if skipped:

1. **The Prisma client must be generated during the build.** It's written
   to `src/generated/prisma`, which is gitignored, so it doesn't exist in
   the deployed repo until it's generated. `package.json`'s `build` script
   already runs `prisma generate && next build` and there's a `postinstall`
   script too, so a plain `vercel deploy` handles this automatically — no
   action needed unless a custom build command overrides it.
2. **`file:./dev.db` does not work in production.** Vercel's filesystem is
   read-only (except `/tmp`, which doesn't persist across invocations or
   deployments), so a local SQLite file can't be written to, and even if it
   could, the data would vanish on the next cold start. Point `DATABASE_URL`
   at a **hosted libSQL database** instead — e.g. [Turso](https://turso.tech):

   ```bash
   turso db create blockforge
   turso db show blockforge --url        # -> DATABASE_URL
   turso db tokens create blockforge      # -> DATABASE_AUTH_TOKEN
   ```

   Set `DATABASE_URL` and `DATABASE_AUTH_TOKEN` as Vercel project env vars
   (Project Settings → Environment Variables), along with `AUTH_SECRET`.
   No code changes are needed — `src/lib/db.ts` already reads both and the
   `@prisma/adapter-libsql` driver speaks the same protocol either way.
3. After setting `DATABASE_URL` to the hosted database, run the migrations
   against it once (locally, pointed at the remote URL, or via a Vercel
   build hook): `npx prisma migrate deploy`.

If the deploy still fails, check the Vercel build/function logs for the
actual error — "Module not found: '@/generated/prisma/client'" means (1)
above wasn't picked up; anything mentioning `SQLITE_READONLY`, "unable to
open database file", or a 500 on login/signup means (2).

## Using a real image-generation API instead

`generateTexture()` in `src/lib/textureGen.ts` is the single seam to swap.
Keep its signature (`(prompt: string) => Promise<{ png: Buffer, ... }>`) and
point it at a real text-to-image API, gated behind the `IMAGE_GEN_API_KEY`
env var, to replace the built-in procedural generator.

## Installing a generated datapack in Minecraft

Each project's "Download datapack .zip" produces:

```
README.txt
datapack/pack.mcmeta
datapack/data/<namespace>/structure/<name>.nbt
datapack/data/<namespace>/function/<name>.mcfunction   (place template ...)
resourcepack/pack.mcmeta
resourcepack/assets/minecraft/textures/item/paper.png
resourcepack/assets/minecraft/models/item/paper.json
```

1. Copy `datapack/` into `<world save>/datapacks/`, then `/reload` in-game.
2. Run `/function <namespace>:<structure_name>` to place it at your position.
3. (Optional) Copy `resourcepack/` into `.minecraft/resourcepacks/` and
   enable it to reskin vanilla Paper items with your generated texture.

Targets Minecraft Java Edition 1.20 - 1.20.4 (pack_format 15,
DataVersion 3465). Newer clients may show a "may not work" warning when
loading the pack — that's expected; confirm through and it will load fine,
since Minecraft upgrades old structure data forward automatically.

## Project structure

```
src/lib/textureGen.ts     procedural texture synthesis
src/lib/voxelizer.ts      photo -> voxel structure conversion
src/lib/blockPalette.ts   ~50-block color palette used by both of the above
src/lib/nbt.ts            generic big-endian NBT writer (from scratch)
src/lib/structure.ts      Minecraft structure-file NBT builder
src/lib/datapack.ts       zips structures + texture into a datapack + resourcepack
src/auth.ts               NextAuth v5 config (Credentials + JWT sessions)
src/proxy.ts              route protection for /dashboard (Next 16 "proxy", formerly middleware)
prisma/schema.prisma      User / Project / TextureAsset / StructureAsset
```

## Not in scope

A full Creative-mode clone (in-world building UI, arbitrary block/entity
authoring, live world editing) is a materially larger project than a
"generate one type of mod" tool and was intentionally left out to keep this
scoped and finished end-to-end rather than partially covering a much wider
surface.
