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

const STATUS_STYLE: Record<string, { badge: string; border: string; dot: string; label: string }> = {
  PENDING:   { badge: "bg-amber-100 text-amber-700",   border: "border-amber-300",  dot: "bg-amber-500",  label: "Pending" },
  PREPARING: { badge: "bg-blue-100 text-blue-700",     border: "border-blue-300",   dot: "bg-blue-500",   label: "Preparing" },
  READY:     { badge: "bg-green-100 text-green-700",   border: "border-green-300",  dot: "bg-green-500",  label: "Ready" },
  SERVED:    { badge: "bg-indigo-100 text-indigo-700", border: "border-indigo-300", dot: "bg-indigo-500", label: "Served" },
  COMPLETED: { badge: "bg-stone-100 text-stone-500",   border: "border-stone-200",  dot: "bg-stone-400",  label: "Done" },
};

const ACTIVE = new Set(["PENDING", "PREPARING", "READY"]);

type Tab = "active" | "served" | "all";

function playBell() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* ignore */ }
}

export default function DashboardOrdersPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState(false);
  const [tab, setTab] = useState<Tab>("active");
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRestaurant = useCallback(async () => {
    const res = await fetch("/api/restaurants");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) setRestaurantId(data[0].id);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    const res = await fetch(`/api/restaurants/${restaurantId}/orders`);
    if (res.ok) setOrders(await res.json());
  }, [restaurantId]);

  useEffect(() => { fetchRestaurant(); }, [fetchRestaurant]);

  useEffect(() => {
    if (!restaurantId) return;
    fetchOrders().finally(() => setLoading(false));
  }, [restaurantId, fetchOrders]);

  useEffect(() => {
    if (!restaurantId) return;
    const t = setInterval(fetchOrders, 30_000);
    return () => clearInterval(t);
  }, [restaurantId, fetchOrders]);

  const flash = useCallback(() => {
    if (alertTimer.current) clearTimeout(alertTimer.current);
    setNewAlert(true);
    alertTimer.current = setTimeout(() => setNewAlert(false), 3500);
  }, []);

  useNewOrders(restaurantId, useCallback((raw: unknown) => {
    const o = raw as Order;
    setOrders((prev) => {
      if (prev.some((x) => x.id === o.id)) return prev;
      playBell();
      flash();
      return [o, ...prev];
    });
  }, [flash]));

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

  const filtered = orders.filter((o) =>
    tab === "active" ? ACTIVE.has(o.status) :
    tab === "served" ? (o.status === "SERVED" || o.status === "COMPLETED") :
    true
  );

  const byTable = filtered.reduce<Record<string, Order[]>>((acc, o) => {
    const key = o.table?.label ?? o.tableId;
    (acc[key] ??= []).push(o);
    return acc;
  }, {});

  const activeCount = orders.filter((o) => ACTIVE.has(o.status)).length;

  if (!restaurantId && !loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center gap-3 p-4">
        <p className="text-stone-500 text-sm">No restaurant found. Run seed first.</p>
        <Link href="/dashboard" className="text-orange-500 text-sm font-medium">← Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* New order toast */}
      {newAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-stone-900 text-white text-sm font-semibold shadow-xl pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          New order received!
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-base font-bold text-stone-900 flex-1">Live orders</h1>
          <button
            type="button"
            onClick={fetchOrders}
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-stone-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 flex gap-0 border-t border-stone-50">
          {([
            { id: "active" as Tab, label: "Active", count: activeCount },
            { id: "served" as Tab, label: "Served / Done" },
            { id: "all" as Tab, label: "All" },
          ]).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] leading-none font-bold">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-white rounded-2xl border border-stone-100 animate-pulse" />
            ))}
          </div>
        ) : Object.keys(byTable).length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-20">🍽</div>
            <p className="text-stone-400 text-sm">
              {tab === "active" ? "No active orders right now." : "Nothing to show."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(byTable).map(([tableLabel, tableOrders]) => (
              <section key={tableLabel}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">{tableLabel}</span>
                  </div>
                  <span className="text-sm font-semibold text-stone-700">Table {tableLabel}</span>
                  <span className="text-xs text-stone-400">
                    {tableOrders.length} order{tableOrders.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3">
                  {tableOrders.map((order) => {
                    const style = STATUS_STYLE[order.status] ?? STATUS_STYLE.PENDING;
                    const total = order.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden"
                      >
                        {/* Card header */}
                        <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap border-b border-stone-50">
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {style.label}
                            </span>
                            <span className="text-xs text-stone-400">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="text-xs text-stone-300 bg-stone-50 px-2 py-0.5 rounded-md">
                              {order.paymentType === "ONLINE" ? "Online" : "Counter"}
                            </span>
                          </div>

                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-orange-400 cursor-pointer hover:border-stone-300 transition-colors"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_STYLE[s]?.label ?? s}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Items */}
                        <ul className="px-4 py-2 divide-y divide-stone-50">
                          {order.items.map((oi) => (
                            <li key={oi.id} className="py-2 flex justify-between text-sm">
                              <span className="text-stone-700">
                                {oi.menuItem.name}
                                <span className="text-stone-400"> × {oi.quantity}</span>
                              </span>
                              <span className="text-stone-900 font-medium">
                                ${(Number(oi.unitPrice) * oi.quantity).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* Total */}
                        <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                          <span className="text-xs text-stone-400">Order total</span>
                          <span className="text-sm font-bold text-stone-900">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
