"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, theme }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Something went wrong" }));
      setError(body.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const { project } = await res.json();
    router.push(`/dashboard/${project.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-white/70 mb-1" htmlFor="name">
          Project name
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={2}
          maxLength={40}
          placeholder="Ashfall Ruins"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-emerald-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-1" htmlFor="theme">
          Theme / description
        </label>
        <textarea
          id="theme"
          required
          minLength={2}
          maxLength={200}
          rows={3}
          placeholder="A scorched volcanic outpost with obsidian towers and glowing ember accents."
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-emerald-400"
        />
        <p className="mt-1 text-xs text-white/40">
          This seeds texture generation for any blocks you don&apos;t give a specific prompt.
        </p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-500 px-4 py-2.5 font-mono font-semibold text-black hover:bg-emerald-400 transition disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}
