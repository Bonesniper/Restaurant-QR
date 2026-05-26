"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  status: string;
  paymentType: string | null;
  createdAt: string;
  table: { label: string };
  items: { quantity: number; unitPrice: string; menuItem: { name: string } }[];
  payment?: { type: string; status: string; amount: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-600",
  PREPARING: "bg-blue-50 text-blue-600",
  READY:     "bg-green-50 text-green-600",
  SERVED:    "bg-indigo-50 text-indigo-600",
  COMPLETED: "bg-stone-100 text-stone-500",
};

function total(order: Order) {
  return order.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
}

export default function DashboardHistoryPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = useCallback(async () => {
    const res = await fetch("/api/restaurants");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) setRestaurantId(data[0].id);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    const res = await fetch(`/api/restaurants/${restaurantId}/orders?date=${date}`);
    if (res.ok) setOrders(await res.json());
  }, [restaurantId, date]);

  useEffect(() => { fetchRestaurant(); }, [fetchRestaurant]);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    fetchOrders().finally(() => setLoading(false));
  }, [restaurantId, date, fetchOrders]);

  const revenue = orders.reduce((s, o) => s + total(o), 0);
  const onlineRev = orders.filter((o) => o.paymentType === "ONLINE").reduce((s, o) => s + total(o), 0);
  const counterRev = orders.filter((o) => o.paymentType !== "ONLINE").reduce((s, o) => s + total(o), 0);

  if (!restaurantId && !loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center gap-3 p-4">
        <p className="text-stone-500 text-sm">No restaurant found. Run seed.</p>
        <Link href="/dashboard" className="text-orange-500 text-sm font-medium">← Back</Link>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center gap-4">
          <Link href="/dashboard" className="text-stone-400 hover:text-stone-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-base font-bold text-stone-900">Order history</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Date control */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2 shadow-card">
            <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm font-medium text-stone-700 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
          {date !== today && (
            <button
              type="button"
              onClick={() => setDate(today)}
              className="text-xs text-orange-500 font-semibold hover:underline"
            >
              Jump to today
            </button>
          )}
          {!loading && (
            <span className="text-xs text-stone-400 ml-auto">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Revenue cards */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: revenue, sub: `${orders.length} orders`, color: "text-stone-900" },
              { label: "Online", value: onlineRev, sub: `${orders.filter(o => o.paymentType === "ONLINE").length} orders`, color: "text-green-600" },
              { label: "Counter", value: counterRev, sub: `${orders.filter(o => o.paymentType !== "ONLINE").length} orders`, color: "text-blue-600" },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl border border-stone-100 shadow-card p-4">
                <p className="text-xs text-stone-400 mb-1">{card.label}</p>
                <p className={`text-lg font-bold ${card.color}`}>${card.value.toFixed(2)}</p>
                <p className="text-xs text-stone-300 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-white rounded-2xl border border-stone-100 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-20">📋</div>
            <p className="text-stone-400 text-sm">No orders on this date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap border-b border-stone-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-stone-900">Table {order.table.label}</span>
                    <span className="text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md font-medium">
                      {order.paymentType === "ONLINE" ? "Online" : "Counter"}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-500"}`}>
                    {order.status}
                  </span>
                </div>
                <ul className="px-4 py-2 divide-y divide-stone-50">
                  {order.items.map((oi, i) => (
                    <li key={i} className="py-1.5 flex justify-between text-sm">
                      <span className="text-stone-600">{oi.menuItem.name} × {oi.quantity}</span>
                      <span className="text-stone-900 font-medium">${(Number(oi.unitPrice) * oi.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 flex justify-between">
                  <span className="text-xs text-stone-400">Total</span>
                  <span className="text-sm font-bold text-stone-900">${total(order).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
