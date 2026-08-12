import { nbtCompound, nbtInt, nbtIntList, nbtList, nbtString, writeNbtFile, TAG } from "./nbt";
import type { VoxelResult } from "./voxelizer";

// DataVersion for Minecraft Java 1.20.1. Chosen deliberately old-ish (rather
// than bleeding edge) so the game's DataFixerUpper can safely upgrade the
// structure forward on load; a DataVersion newer than the running game
// would fail to load instead.
export const STRUCTURE_DATA_VERSION = 3465;

export function buildStructureNbt(voxel: Omit<VoxelResult, "previewPng">): Buffer {
  const paletteTag = nbtList(
    TAG.Compound,
    voxel.palette.map((name) => nbtCompound({ Name: nbtString(name) }))
  );

  const blocksTag = nbtList(
    TAG.Compound,
    voxel.blocks.map((b) =>
      nbtCompound({
        state: nbtInt(b.paletteIndex),
        pos: nbtIntList([b.x, b.y, b.z]),
      })
    )
  );

  const root = {
    DataVersion: nbtInt(STRUCTURE_DATA_VERSION),
    size: nbtIntList([voxel.width, voxel.height, voxel.depth]),
    entities: nbtList(TAG.Compound, []),
    blocks: blocksTag,
    palette: paletteTag,
  };

  return writeNbtFile(root);
}
