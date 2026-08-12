import sharp from "sharp";
import { hashString, mulberry32 } from "./prng";

const SIZE = 16;

type RGB = [number, number, number];

const KEYWORD_HUES: Record<string, number> = {
  red: 0, blood: 355, fire: 18, orange: 28, lava: 20,
  yellow: 48, gold: 45, sand: 42, sun: 50,
  green: 105, grass: 100, leaf: 110, leaves: 110, forest: 120, emerald: 140,
  cyan: 185, teal: 175, ice: 195, water: 210, blue: 220, sky: 200, lapis: 230,
  purple: 275, magic: 280, void: 265, amethyst: 270,
  pink: 320, magenta: 310,
  white: 0, snow: 0, quartz: 40,
  black: 0, obsidian: 260, coal: 0, dark: 0,
  gray: 0, grey: 0, stone: 30, ash: 0,
  brown: 30, wood: 32, dirt: 28, mud: 30,
};

type PatternKind = "planks" | "brick" | "speckle" | "metal" | "mottled" | "wave";

function pickPattern(prompt: string): PatternKind {
  const p = prompt.toLowerCase();
  if (/wood|plank|log|timber/.test(p)) return "planks";
  if (/brick|masonry/.test(p)) return "brick";
  if (/metal|ore|gold|iron|copper|diamond|steel|armor/.test(p)) return "metal";
  if (/leaf|leaves|grass|plant|moss|vine|coral/.test(p)) return "mottled";
  if (/water|ice|crystal|gem|glass|magic|void/.test(p)) return "wave";
  return "speckle";
}

function pickHue(prompt: string, rng: () => number): number {
  const p = prompt.toLowerCase();
  for (const [keyword, hue] of Object.entries(KEYWORD_HUES)) {
    if (p.includes(keyword)) return hue;
  }
  return Math.floor(rng() * 360);
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function shade(rgb: RGB, amount: number): RGB {
  return [
    clamp(Math.round(rgb[0] + amount), 0, 255),
    clamp(Math.round(rgb[1] + amount), 0, 255),
    clamp(Math.round(rgb[2] + amount), 0, 255),
  ];
}

export type GeneratedTexture = {
  png: Buffer;
  seed: number;
  palette: RGB[];
};

/**
 * Procedurally synthesizes a 16x16 Minecraft-style block texture from a text
 * prompt. No network calls: this is a deterministic, seeded generator so the
 * same prompt always reproduces the same texture. Swap in a real
 * text-to-image API by replacing this function's body once IMAGE_GEN_API_KEY
 * is configured (see README).
 */
export async function generateTexture(prompt: string, seedOverride?: number): Promise<GeneratedTexture> {
  const seed = seedOverride ?? hashString(prompt);
  const rng = mulberry32(seed);
  const hue = pickHue(prompt, rng);
  const saturation = 0.35 + rng() * 0.35;
  const lightness = 0.32 + rng() * 0.22;
  const base = hslToRgb(hue, saturation, lightness);
  const light = shade(base, 28 + rng() * 12);
  const dark = shade(base, -(28 + rng() * 12));
  const pattern = pickPattern(prompt);

  const pixels = Buffer.alloc(SIZE * SIZE * 4);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let rgb: RGB = base;

      switch (pattern) {
        case "planks": {
          const plankRow = Math.floor(y / 4) % 2;
          const seamX = (x + plankRow * 3) % 8 === 0;
          const grain = Math.sin(x * 1.3 + y * 0.2) * 6;
          rgb = seamX ? dark : shade(base, grain);
          break;
        }
        case "brick": {
          const row = Math.floor(y / 4);
          const offset = row % 2 === 0 ? 0 : 4;
          const withinRow = y % 4;
          const withinCol = (x + offset) % 8;
          const isMortar = withinRow === 0 || withinCol === 0;
          rgb = isMortar ? dark : shade(base, (rng() - 0.5) * 14);
          break;
        }
        case "metal": {
          const diag = (x + y) % 6;
          rgb = diag < 1 ? light : diag > 4 ? dark : shade(base, (rng() - 0.5) * 10);
          break;
        }
        case "mottled": {
          const n = Math.sin(x * 0.9 + rng() * 6) * Math.cos(y * 0.9 + rng() * 6);
          rgb = n > 0.25 ? light : n < -0.25 ? dark : base;
          break;
        }
        case "wave": {
          const wave = Math.sin(x * 0.6 + y * 0.35) * 18;
          rgb = shade(base, wave);
          break;
        }
        case "speckle":
        default: {
          const roll = rng();
          rgb = roll < 0.15 ? dark : roll > 0.88 ? light : shade(base, (rng() - 0.5) * 16);
          break;
        }
      }

      const idx = (y * SIZE + x) * 4;
      pixels[idx] = rgb[0];
      pixels[idx + 1] = rgb[1];
      pixels[idx + 2] = rgb[2];
      pixels[idx + 3] = 255;
    }
  }

  const png = await sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png()
    .toBuffer();

  return { png, seed, palette: [base, light, dark] };
}

/** Upscales a texture buffer with nearest-neighbor scaling for crisp previews. */
export async function upscaleTexture(png: Buffer, scale: number): Promise<Buffer> {
  return sharp(png)
    .resize(SIZE * scale, SIZE * scale, { kernel: "nearest" })
    .png()
    .toBuffer();
}
