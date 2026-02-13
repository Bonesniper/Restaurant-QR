"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useNewOrders } from "@/hooks/useNewOrders";

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: string;
  menuItem: { name: string };
};

type Order = {
  id: string;
  tableId: string;
  status: string;
  paymentType: string | null;
  createdAt: string;
  items: OrderItem[];
  table?: { label: string };
  payment?: { type: string; status: string } | null;
};

const STATUSES = ["PENDING", "PREPARING", "READY", "SERVED", "COMPLETED"] as const;
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 border-amber-300 text-amber-800",
  PREPARING: "bg-blue-100 border-blue-300 text-blue-800",
  READY: "bg-green-100 border-green-300 text-green-800",
  SERVED: "bg-indigo-100 border-indigo-300 text-indigo-800",
  COMPLETED: "bg-gray-100 border-gray-300 text-gray-800",
};

function playNewOrderSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch {
    // ignore
  }
}

export default function DashboardOrdersPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(false);
  const ordersByTable = orders.reduce<Record<string, Order[]>>((acc, o) => {
    const key = o.table?.label ?? o.tableId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  }, {});
  const prevCountRef = useRef(0);

  const fetchRestaurant = useCallback(async () => {
    const res = await fetch("/api/restaurants");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      setRestaurantId(data[0].id);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    const res = await fetch(`/api/restaurants/${restaurantId}/orders`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  useEffect(() => {
    if (!restaurantId) return;
    fetchOrders().finally(() => setLoading(false));
  }, [restaurantId, fetchOrders]);

  useNewOrders(restaurantId, useCallback((newOrder: unknown) => {
    const o = newOrder as Order;
    setOrders((prev) => {
      const exists = prev.some((x) => x.id === o.id);
      if (exists) return prev;
      playNewOrderSound();
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
      return [o, ...prev];
    });
  }, []));

  useEffect(() => {
    if (orders.length > prevCountRef.current && prevCountRef.current > 0) {
      playNewOrderSound();
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
    }
    prevCountRef.current = orders.length;
  }, [orders.length]);

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
  };

  if (!restaurantId && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-gray-600">No restaurant found. Run seed first.</p>
        <Link href="/dashboard" className="ml-4 text-amber-600">Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-amber-600 font-medium">
          ← Dashboard
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Live orders</h1>
        <div className="w-20" />
      </header>

      {alert && (
        <div className="fixed top-16 left-4 right-4 z-20 py-3 px-4 bg-amber-500 text-white font-bold rounded-xl shadow-lg animate-pulse text-center">
          New order received!
        </div>
      )}

      <main className="p-4 max-w-4xl mx-auto">
        {loading ? (
          <p className="text-gray-600">Loading orders…</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(ordersByTable).map(([tableLabel, tableOrders]) => (
              <section key={tableLabel}>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
                    {tableLabel}
                  </span>
                  Table {tableLabel}
                </h2>
                <div className="space-y-4">
                  {tableOrders.map((order) => (
                    <article
                      key={order.id}
                      className={`rounded-2xl border-2 overflow-hidden ${
                        order.status === "PENDING"
                          ? "border-amber-400 bg-amber-50/50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="p-4 flex flex-wrap items-center justify-between gap-2 border-b bg-white">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-xs">
                            {order.paymentType === "ONLINE" ? "Online" : "Counter"}
                          </span>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`px-3 py-2 rounded-lg font-medium border-2 ${
                            STATUS_COLORS[order.status] ?? "bg-gray-100"
                          }`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <ul className="p-4 divide-y divide-gray-100">
                        {order.items.map((oi) => (
                          <li key={oi.id} className="py-2 flex justify-between text-lg">
                            <span>
                              {oi.menuItem.name} × {oi.quantity}
                            </span>
                            <span className="text-gray-600">
                              ${(Number(oi.unitPrice) * oi.quantity).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="px-4 py-3 bg-gray-50 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>
                          $
                          {order.items
                            .reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-gray-500 py-12">No orders yet.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
