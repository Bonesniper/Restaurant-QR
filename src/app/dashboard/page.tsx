"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        else router.replace("/dashboard/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.replace("/dashboard/login");
              router.refresh();
            }}
            className="text-sm text-amber-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/orders"
            className="block p-6 bg-white rounded-xl shadow border border-gray-200 hover:border-amber-300 transition"
          >
            <h2 className="text-lg font-bold text-gray-800">Live orders</h2>
            <p className="text-sm text-gray-500 mt-1">View and update order status</p>
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/dashboard/menu"
              className="block p-6 bg-white rounded-xl shadow border border-gray-200 hover:border-amber-300 transition"
            >
              <h2 className="text-lg font-bold text-gray-800">Menu management</h2>
              <p className="text-sm text-gray-500 mt-1">Categories and items</p>
            </Link>
          )}
          <Link
            href="/dashboard/history"
            className="block p-6 bg-white rounded-xl shadow border border-gray-200 hover:border-amber-300 transition"
          >
            <h2 className="text-lg font-bold text-gray-800">Order history</h2>
            <p className="text-sm text-gray-500 mt-1">Daily orders</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
