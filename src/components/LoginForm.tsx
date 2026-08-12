"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-white/70 mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-emerald-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-emerald-400"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-500 px-4 py-2.5 font-mono font-semibold text-black hover:bg-emerald-400 transition disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-sm text-white/50">
        No account?{" "}
        <Link href="/signup" className="text-emerald-400 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
