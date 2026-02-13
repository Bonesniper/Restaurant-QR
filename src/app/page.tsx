"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [demoTableId, setDemoTableId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/demo/table")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.tableId && setDemoTableId(data.tableId))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-b from-amber-50 to-orange-50">
      <h1 className="text-2xl font-bold text-gray-800">Restaurant QR Order</h1>
      <p className="text-gray-600 text-center max-w-sm">
        Scan the QR code at your table to open the menu and order.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition"
        >
          Staff Dashboard
        </Link>
        {demoTableId ? (
          <Link
            href={`/table/${demoTableId}`}
            className="px-6 py-3 rounded-xl border-2 border-amber-600 text-amber-700 font-medium hover:bg-amber-50 transition"
          >
            Demo: Open menu (no QR)
          </Link>
        ) : (
          <span className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-500">
            Demo (run seed first)
          </span>
        )}
      </div>
    </main>
  );
}
