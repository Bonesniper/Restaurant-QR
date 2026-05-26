"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const NAV = [
  {
    href: "/dashboard/orders",
    icon: "🟠",
    title: "Live orders",
    desc: "Manage incoming orders in real time",
    adminOnly: false,
  },
  {
    href: "/dashboard/menu",
    icon: "📋",
    title: "Menu",
    desc: "Add and edit categories, items, prices",
    adminOnly: true,
  },
  {
    href: "/dashboard/history",
    icon: "📊",
    title: "History",
    desc: "Browse past orders and revenue by date",
    adminOnly: false,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) setUser(d.user);
        else router.replace("/dashboard/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/dashboard/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const visibleNav = NAV.filter((n) => !n.adminOnly || user.role === "ADMIN");

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900 leading-tight">{user.name}</p>
              <p className="text-xs text-stone-400">{user.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="space-y-3">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-stone-100 shadow-card hover:shadow-card-hover hover:border-stone-200 active:scale-[0.99] transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-stone-50 group-hover:bg-orange-50 flex items-center justify-center text-xl shrink-0 transition-colors">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 text-sm">{item.title}</p>
                <p className="text-stone-400 text-xs mt-0.5">{item.desc}</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
