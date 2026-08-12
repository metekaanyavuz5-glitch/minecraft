"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-white/10 bg-black/30 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-mono font-bold tracking-tight text-lg">
          <span className="inline-block h-5 w-5 bg-emerald-500 shadow-[3px_3px_0_0_rgba(0,0,0,0.4)]" />
          Blockforge
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {status === "loading" ? null : session?.user ? (
            <>
              <Link href="/dashboard" className="text-white/80 hover:text-white transition">
                Dashboard
              </Link>
              <span className="hidden sm:inline text-white/40">{session.user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-none border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white/80 hover:text-white transition">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-none bg-emerald-500 px-3 py-1.5 font-medium text-black hover:bg-emerald-400 transition"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
