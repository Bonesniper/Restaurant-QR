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
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  }, [restaurantId, date]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    fetchOrders().finally(() => setLoading(false));
  }, [restaurantId, date, fetchOrders]);

  const totalRevenue = orders.reduce((sum, o) => {
    const total = o.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
    return sum + total;
  }, 0);

  if (!restaurantId && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-gray-600">No restaurant. Run seed.</p>
        <Link href="/dashboard" className="ml-4 text-amber-600">Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-amber-600 font-medium">← Dashboard</Link>
        <h1 className="text-xl font-bold text-gray-800">Order history</h1>
        <div className="w-20" />
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 rounded-lg border"
            />
          </label>
          <div className="text-lg font-bold text-gray-800">
            Total: ${totalRevenue.toFixed(2)} ({orders.length} orders)
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="bg-white rounded-xl border p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">Table {order.table.label}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {order.paymentType === "ONLINE" ? "Online" : "Counter"} · {order.status}
                  </span>
                </div>
                <ul className="divide-y text-sm">
                  {order.items.map((oi, i) => (
                    <li key={i} className="py-1 flex justify-between">
                      <span>{oi.menuItem.name} × {oi.quantity}</span>
                      <span>${(Number(oi.unitPrice) * oi.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 pt-2 border-t font-medium flex justify-end">
                  ${order.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0).toFixed(2)}
                </div>
              </article>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-gray-500 py-12">No orders for this date.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
