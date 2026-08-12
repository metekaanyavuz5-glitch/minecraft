// A curated set of common Minecraft (Java Edition) blocks with an approximate
// average RGB color each. Used to (a) quantize uploaded photos into a block
// palette for the voxelizer, and (b) drive palette choices for the
// procedural texture generator. Colors are hand-approximated, not extracted
// from game assets.

export type PaletteBlock = {
  id: string;
  rgb: [number, number, number];
  tags: string[];
};

export const BLOCK_PALETTE: PaletteBlock[] = [
  { id: "minecraft:white_concrete", rgb: [207, 213, 214], tags: ["white", "bright"] },
  { id: "minecraft:light_gray_concrete", rgb: [125, 125, 115], tags: ["gray"] },
  { id: "minecraft:gray_concrete", rgb: [54, 57, 61], tags: ["gray", "dark"] },
  { id: "minecraft:black_concrete", rgb: [8, 10, 15], tags: ["black", "dark"] },
  { id: "minecraft:red_concrete", rgb: [142, 33, 33], tags: ["red"] },
  { id: "minecraft:orange_concrete", rgb: [224, 97, 1], tags: ["orange"] },
  { id: "minecraft:yellow_concrete", rgb: [240, 175, 21], tags: ["yellow"] },
  { id: "minecraft:lime_concrete", rgb: [94, 168, 24], tags: ["green", "bright"] },
  { id: "minecraft:green_concrete", rgb: [73, 91, 36], tags: ["green", "dark"] },
  { id: "minecraft:cyan_concrete", rgb: [21, 119, 136], tags: ["cyan"] },
  { id: "minecraft:light_blue_concrete", rgb: [36, 137, 199], tags: ["blue", "bright"] },
  { id: "minecraft:blue_concrete", rgb: [45, 47, 143], tags: ["blue", "dark"] },
  { id: "minecraft:purple_concrete", rgb: [100, 32, 156], tags: ["purple"] },
  { id: "minecraft:magenta_concrete", rgb: [169, 48, 159], tags: ["pink", "purple"] },
  { id: "minecraft:pink_concrete", rgb: [214, 101, 143], tags: ["pink"] },
  { id: "minecraft:brown_concrete", rgb: [96, 60, 32], tags: ["brown"] },
  { id: "minecraft:stone", rgb: [125, 125, 125], tags: ["gray", "terrain"] },
  { id: "minecraft:cobblestone", rgb: [111, 111, 111], tags: ["gray", "terrain"] },
  { id: "minecraft:andesite", rgb: [136, 136, 132], tags: ["gray", "terrain"] },
  { id: "minecraft:diorite", rgb: [188, 188, 187], tags: ["white", "terrain"] },
  { id: "minecraft:granite", rgb: [149, 103, 85], tags: ["brown", "terrain"] },
  { id: "minecraft:deepslate", rgb: [70, 70, 74], tags: ["gray", "dark", "terrain"] },
  { id: "minecraft:dirt", rgb: [134, 96, 67], tags: ["brown", "terrain"] },
  { id: "minecraft:coarse_dirt", rgb: [117, 85, 60], tags: ["brown", "terrain"] },
  { id: "minecraft:grass_block", rgb: [95, 159, 53], tags: ["green", "terrain"] },
  { id: "minecraft:podzol", rgb: [92, 65, 32], tags: ["brown", "terrain"] },
  { id: "minecraft:sand", rgb: [219, 207, 163], tags: ["yellow", "terrain"] },
  { id: "minecraft:red_sand", rgb: [190, 101, 34], tags: ["orange", "terrain"] },
  { id: "minecraft:gravel", rgb: [132, 127, 122], tags: ["gray", "terrain"] },
  { id: "minecraft:oak_log", rgb: [102, 82, 49], tags: ["brown", "wood"] },
  { id: "minecraft:oak_planks", rgb: [162, 130, 78], tags: ["brown", "wood"] },
  { id: "minecraft:spruce_planks", rgb: [114, 84, 48], tags: ["brown", "wood", "dark"] },
  { id: "minecraft:birch_planks", rgb: [196, 179, 123], tags: ["yellow", "wood"] },
  { id: "minecraft:dark_oak_planks", rgb: [66, 43, 20], tags: ["brown", "wood", "dark"] },
  { id: "minecraft:crimson_planks", rgb: [219, 104, 138], tags: ["pink", "wood"] },
  { id: "minecraft:warped_planks", rgb: [37, 143, 137], tags: ["cyan", "wood"] },
  { id: "minecraft:oak_leaves", rgb: [60, 92, 30], tags: ["green", "terrain"] },
  { id: "minecraft:snow_block", rgb: [249, 254, 254], tags: ["white", "bright"] },
  { id: "minecraft:ice", rgb: [148, 178, 253], tags: ["blue", "bright"] },
  { id: "minecraft:water", rgb: [63, 118, 228], tags: ["blue"] },
  { id: "minecraft:glass", rgb: [214, 231, 231], tags: ["white", "bright"] },
  { id: "minecraft:obsidian", rgb: [20, 18, 29], tags: ["black", "dark"] },
  { id: "minecraft:netherrack", rgb: [111, 54, 52], tags: ["red", "dark"] },
  { id: "minecraft:crimson_nylium", rgb: [140, 30, 34], tags: ["red"] },
  { id: "minecraft:warped_nylium", rgb: [20, 128, 121], tags: ["cyan"] },
  { id: "minecraft:soul_sand", rgb: [82, 63, 51], tags: ["brown", "dark"] },
  { id: "minecraft:magma_block", rgb: [130, 66, 24], tags: ["orange", "dark"] },
  { id: "minecraft:gold_block", rgb: [246, 208, 60], tags: ["yellow", "bright", "metal"] },
  { id: "minecraft:iron_block", rgb: [216, 216, 208], tags: ["white", "metal"] },
  { id: "minecraft:diamond_block", rgb: [98, 219, 213], tags: ["cyan", "bright", "metal"] },
  { id: "minecraft:emerald_block", rgb: [42, 168, 88], tags: ["green", "bright", "metal"] },
  { id: "minecraft:lapis_block", rgb: [37, 65, 148], tags: ["blue", "dark", "metal"] },
  { id: "minecraft:redstone_block", rgb: [171, 21, 15], tags: ["red", "metal"] },
  { id: "minecraft:copper_block", rgb: [186, 106, 79], tags: ["orange", "metal"] },
  { id: "minecraft:coal_block", rgb: [16, 16, 16], tags: ["black", "dark"] },
  { id: "minecraft:quartz_block", rgb: [235, 229, 222], tags: ["white", "bright"] },
  { id: "minecraft:terracotta", rgb: [152, 94, 68], tags: ["brown"] },
  { id: "minecraft:white_terracotta", rgb: [209, 178, 161], tags: ["white"] },
  { id: "minecraft:bricks", rgb: [150, 97, 83], tags: ["red", "brown"] },
];

function colorDistanceSq(a: [number, number, number], b: [number, number, number]) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

export function nearestBlock(rgb: [number, number, number]): PaletteBlock {
  let best = BLOCK_PALETTE[0];
  let bestDist = Infinity;
  for (const block of BLOCK_PALETTE) {
    const dist = colorDistanceSq(rgb, block.rgb);
    if (dist < bestDist) {
      bestDist = dist;
      best = block;
    }
  }
  return best;
}
