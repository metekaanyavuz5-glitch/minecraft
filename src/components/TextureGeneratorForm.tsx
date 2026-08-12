"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TextureGeneratorForm({ projectId, defaultPrompt }: { projectId: string; defaultPrompt: string }) {
  const router = useRouter();
  const [blockName, setBlockName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}/textures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockName, prompt: prompt.trim() || defaultPrompt }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Something went wrong" }));
      setError(body.error ?? "Something went wrong");
      return;
    }

    setBlockName("");
    setPrompt("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm text-white/70 mb-1" htmlFor="blockName">
          Block name
        </label>
        <input
          id="blockName"
          type="text"
          required
          maxLength={40}
          placeholder="ember_stone"
          value={blockName}
          onChange={(e) => setBlockName(e.target.value)}
          className="w-full border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-emerald-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-1" htmlFor="prompt">
          Prompt <span className="text-white/30">(optional -- defaults to project theme)</span>
        </label>
        <input
          id="prompt"
          type="text"
          maxLength={200}
          placeholder="glowing obsidian brick with ember cracks"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-emerald-400"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-amber-400 px-4 py-2 font-mono font-semibold text-black hover:bg-amber-300 transition disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate texture"}
      </button>
    </form>
  );
}
