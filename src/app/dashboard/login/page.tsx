"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials"); return; }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
          <span className="text-white text-sm font-bold">T</span>
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">TableOrder</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-8">
        <h1 className="text-xl font-bold text-white mb-1">Staff login</h1>
        <p className="text-stone-500 text-sm mb-7">Sign in to manage orders and menu.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@restaurant.com"
              className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-red-400 text-xs font-medium">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 shadow-orange"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-600">
          Demo: admin@restaurant.com / admin123
        </p>
      </div>

      <Link href="/" className="mt-6 text-sm text-stone-600 hover:text-stone-400 transition-colors">
        ← Back to home
      </Link>
    </div>
  );
}
