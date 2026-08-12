"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function StructureUploadForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image first.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.set("image", file);
    if (name.trim()) form.set("name", name.trim());

    const res = await fetch(`/api/projects/${projectId}/structures`, {
      method: "POST",
      body: form,
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Something went wrong" }));
      setError(body.error ?? "Something went wrong");
      return;
    }

    setName("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm text-white/70 mb-1" htmlFor="structureName">
          Structure name <span className="text-white/30">(optional)</span>
        </label>
        <input
          id="structureName"
          type="text"
          maxLength={40}
          placeholder="watchtower"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-emerald-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-1" htmlFor="image">
          Photo
        </label>
        <input
          id="image"
          ref={fileRef}
          type="file"
          accept="image/*"
          required
          className="w-full border border-white/20 bg-white/5 px-3 py-2 text-white/70 file:mr-3 file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white"
        />
        <p className="mt-1 text-xs text-white/40">
          Brightness becomes height, color is matched to the nearest Minecraft block.
        </p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-500 px-4 py-2 font-mono font-semibold text-black hover:bg-emerald-400 transition disabled:opacity-60"
      >
        {loading ? "Voxelizing..." : "Convert to structure"}
      </button>
    </form>
  );
}
