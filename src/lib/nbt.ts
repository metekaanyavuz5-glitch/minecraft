import { gzipSync } from "node:zlib";

// Minimal big-endian NBT (Named Binary Tag) writer, just the tag types
// needed to emit a Minecraft structure file:
// https://minecraft.wiki/w/NBT_format
// https://minecraft.wiki/w/Structure_file

export const TAG = {
  End: 0,
  Byte: 1,
  Short: 2,
  Int: 3,
  Long: 4,
  Float: 5,
  Double: 6,
  ByteArray: 7,
  String: 8,
  List: 9,
  Compound: 10,
  IntArray: 11,
  LongArray: 12,
} as const;

export type NbtTag =
  | { type: "int"; value: number }
  | { type: "string"; value: string }
  | { type: "list"; itemType: number; items: NbtTag[] }
  | { type: "compound"; value: Record<string, NbtTag> };

export const nbtInt = (value: number): NbtTag => ({ type: "int", value });
export const nbtString = (value: string): NbtTag => ({ type: "string", value });
export const nbtCompound = (value: Record<string, NbtTag>): NbtTag => ({ type: "compound", value });
export const nbtList = (itemType: number, items: NbtTag[]): NbtTag => ({ type: "list", itemType, items });
export const nbtIntList = (items: number[]): NbtTag => nbtList(TAG.Int, items.map(nbtInt));

class ByteWriter {
  private chunks: Buffer[] = [];

  writeUInt8(n: number) {
    this.chunks.push(Buffer.from([n & 0xff]));
  }
  writeInt16BE(n: number) {
    const b = Buffer.alloc(2);
    b.writeInt16BE(n, 0);
    this.chunks.push(b);
  }
  writeInt32BE(n: number) {
    const b = Buffer.alloc(4);
    b.writeInt32BE(n, 0);
    this.chunks.push(b);
  }
  writeUtf8(str: string) {
    const strBuf = Buffer.from(str, "utf8");
    this.writeInt16BE(strBuf.length);
    this.chunks.push(strBuf);
  }
  toBuffer() {
    return Buffer.concat(this.chunks);
  }
}

function tagId(tag: NbtTag): number {
  switch (tag.type) {
    case "int": return TAG.Int;
    case "string": return TAG.String;
    case "list": return TAG.List;
    case "compound": return TAG.Compound;
  }
}

function writePayload(w: ByteWriter, tag: NbtTag) {
  switch (tag.type) {
    case "int":
      w.writeInt32BE(tag.value);
      return;
    case "string":
      w.writeUtf8(tag.value);
      return;
    case "list": {
      w.writeUInt8(tag.itemType);
      w.writeInt32BE(tag.items.length);
      for (const item of tag.items) writePayload(w, item);
      return;
    }
    case "compound": {
      for (const [key, value] of Object.entries(tag.value)) {
        w.writeUInt8(tagId(value));
        w.writeUtf8(key);
        writePayload(w, value);
      }
      w.writeUInt8(TAG.End);
      return;
    }
  }
}

/** Serializes a root TAG_Compound (with empty name, as Minecraft expects) and gzips it. */
export function writeNbtFile(root: Record<string, NbtTag>): Buffer {
  const w = new ByteWriter();
  w.writeUInt8(TAG.Compound);
  w.writeUtf8(""); // root name is empty for structure files
  writePayload(w, nbtCompound(root));
  return gzipSync(w.toBuffer());
}
