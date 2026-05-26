"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [demoTableId, setDemoTableId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/demo/table")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.tableId && setDemoTableId(d.tableId))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="text-white font-semibold tracking-tight">TableOrder</span>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-stone-400 hover:text-white transition-colors"
        >
          Staff login →
        </Link>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-800 bg-stone-900 text-stone-400 text-xs font-medium mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          QR table ordering system
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6">
          Scan. Order.
          <br />
          <span className="text-orange-500">Enjoy.</span>
        </h1>

        <p className="text-stone-500 text-base sm:text-lg max-w-xs mb-12 leading-relaxed">
          A complete QR-based table ordering system for modern restaurants.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
          {demoTableId ? (
            <Link
              href={`/table/${demoTableId}`}
              className="px-8 py-3.5 rounded-2xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 active:scale-[0.98] transition-all shadow-orange"
            >
              Open demo menu →
            </Link>
          ) : (
            <div className="px-8 py-3.5 rounded-2xl bg-stone-800 text-stone-500 font-semibold text-sm">
              Run seed to enable demo
            </div>
          )}
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-300 font-semibold text-sm hover:bg-stone-800 hover:text-white transition-all"
          >
            Staff dashboard
          </Link>
        </div>
      </div>

      {/* Feature strip */}
      <div className="border-t border-stone-900 px-6 py-8">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { label: "Real-time orders", desc: "Socket.io push" },
            { label: "Menu management", desc: "Admin dashboard" },
            { label: "Order tracking", desc: "Live status updates" },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-white text-sm font-medium">{f.label}</p>
              <p className="text-stone-600 text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
