import sharp from "sharp";
import { BLOCK_PALETTE, nearestBlock } from "./blockPalette";

export type VoxelBlock = { x: number; y: number; z: number; paletteIndex: number };

export type VoxelResult = {
  width: number;
  height: number;
  depth: number;
  blocks: VoxelBlock[];
  palette: string[];
  previewPng: Buffer;
};

export type VoxelizeOptions = {
  maxSpan?: number; // max width/depth in blocks
  maxHeight?: number; // max column height in blocks
};

/**
 * Converts a single uploaded photo into a voxel "relief" structure: the
 * image is treated as a heightmap laid on the ground plane (x = image x,
 * z = image y), where pixel brightness becomes column height and pixel
 * color is quantized to the nearest Minecraft block.
 *
 * This is a lightweight, single-image stand-in for 3D Gaussian Splatting
 * reconstruction. True Gaussian Splatting needs many calibrated views (or
 * video) and a GPU-trained radiance field to recover real 3D geometry; that
 * pipeline doesn't fit a single request/response web flow. This module
 * captures the same product idea -- "turn a photo into a placeable 3D
 * in-game asset" -- with a deterministic, instant, single-image algorithm
 * suited to Minecraft's voxel grid.
 */
export async function voxelizeImage(imageBuffer: Buffer, options: VoxelizeOptions = {}): Promise<VoxelResult> {
  const maxSpan = options.maxSpan ?? 28;
  const maxHeight = options.maxHeight ?? 14;

  const image = sharp(imageBuffer).rotate();
  const meta = await image.metadata();
  const srcW = meta.width ?? maxSpan;
  const srcH = meta.height ?? maxSpan;
  const scale = Math.min(maxSpan / srcW, maxSpan / srcH, 1);
  const width = Math.max(1, Math.round(srcW * scale));
  const depth = Math.max(1, Math.round(srcH * scale));

  const { data } = await image
    .resize(width, depth, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const palette: string[] = [];
  const paletteIndex = new Map<string, number>();
  const blocks: VoxelBlock[] = [];
  const previewPixels = Buffer.alloc(width * depth * 4);

  for (let z = 0; z < depth; z++) {
    for (let x = 0; x < width; x++) {
      const idx = (z * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const pIdx = (z * width + x) * 4;
      if (a < 32) {
        // Transparent pixel: carve empty space, no column.
        previewPixels[pIdx] = 255;
        previewPixels[pIdx + 1] = 255;
        previewPixels[pIdx + 2] = 255;
        previewPixels[pIdx + 3] = 0;
        continue;
      }

      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const columnHeight = Math.max(1, Math.round(luminance * (maxHeight - 1)) + 1);
      const block = nearestBlock([r, g, b]);

      let index = paletteIndex.get(block.id);
      if (index === undefined) {
        index = palette.length;
        palette.push(block.id);
        paletteIndex.set(block.id, index);
      }

      for (let y = 0; y < columnHeight; y++) {
        blocks.push({ x, y, z, paletteIndex: index });
      }

      previewPixels[pIdx] = block.rgb[0];
      previewPixels[pIdx + 1] = block.rgb[1];
      previewPixels[pIdx + 2] = block.rgb[2];
      previewPixels[pIdx + 3] = 255;
    }
  }

  if (palette.length === 0) {
    // Fully transparent image fallback: single stone block so exports stay valid.
    palette.push(BLOCK_PALETTE[0].id);
    blocks.push({ x: 0, y: 0, z: 0, paletteIndex: 0 });
  }

  const previewPng = await sharp(previewPixels, { raw: { width, height: depth, channels: 4 } })
    .png()
    .toBuffer();

  return { width, height: maxHeight, depth, blocks, palette, previewPng };
}
