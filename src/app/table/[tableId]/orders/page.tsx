"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useOrderStatusUpdates } from "@/hooks/useOrderStatus";
import type { Order, OrderStatus } from "@/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; dot: string; step: number }> = {
  PENDING:   { label: "Received",   color: "text-amber-600 bg-amber-50",   dot: "bg-amber-500",  step: 1 },
  PREPARING: { label: "Preparing",  color: "text-blue-600 bg-blue-50",     dot: "bg-blue-500",   step: 2 },
  READY:     { label: "Ready",      color: "text-green-600 bg-green-50",   dot: "bg-green-500",  step: 3 },
  SERVED:    { label: "Served",     color: "text-indigo-600 bg-indigo-50", dot: "bg-indigo-500", step: 4 },
  COMPLETED: { label: "Done",       color: "text-stone-600 bg-stone-100",  dot: "bg-stone-400",  step: 5 },
};

const STATUS_STEPS: OrderStatus[] = ["PENDING", "PREPARING", "READY", "SERVED"];

export default function TableOrdersPage() {
  const params = useParams();
  const tableId = params?.tableId as string;

  const [table, setTable] = useState<{ label: string; restaurant: { name: string } } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!tableId) return;
    const res = await fetch(`/api/orders?tableId=${tableId}`);
    if (res.ok) setOrders(await res.json());
  }, [tableId]);

  useEffect(() => {
    if (!tableId) return;
    (async () => {
      const tableRes = await fetch(`/api/tables/${tableId}`);
      if (tableRes.ok) setTable(await tableRes.json());
      await fetchOrders();
      setLoading(false);
    })();
  }, [tableId, fetchOrders]);

  useOrderStatusUpdates(tableId, useCallback(({ orderId, status }) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: status as Order["status"] } : o))
    );
  }, []));

  useEffect(() => {
    if (!tableId) return;
    const t = setInterval(fetchOrders, 10_000);
    return () => clearInterval(t);
  }, [tableId, fetchOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-10">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            href={`/table/${tableId}`}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Menu
          </Link>
          <div className="text-center">
            <p className="text-sm font-semibold text-stone-900">
              {table?.restaurant?.name ?? "Orders"}
            </p>
            <p className="text-xs text-stone-400">Table {table?.label ?? tableId}</p>
          </div>
          <div className="w-14" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-baseline justify-between mb-2">
          <h1 className="text-lg font-bold text-stone-900">Your orders</h1>
          <span className="text-xs text-stone-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-30">📋</div>
            <p className="text-stone-400 text-sm">No orders yet.</p>
            <Link
              href={`/table/${tableId}`}
              className="inline-block mt-4 text-orange-500 text-sm font-medium hover:underline"
            >
              Browse the menu →
            </Link>
          </div>
        ) : (
          orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.PENDING;
            const stepIndex = STATUS_STEPS.indexOf(order.status as OrderStatus);
            const total = order.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden"
              >
                {/* Order header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-stone-50">
                  <div>
                    <p className="text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {" · "}
                      {order.paymentType === "ONLINE" ? "Paid online" : "Pay at counter"}
                    </p>
                    <p className="text-xs text-stone-300 mt-0.5">#{order.id.slice(-6).toUpperCase()}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                {/* Progress bar */}
                {order.status !== "COMPLETED" && stepIndex >= 0 && (
                  <div className="px-4 pt-3 pb-1">
                    <div className="flex items-center gap-1">
                      {STATUS_STEPS.map((s, i) => (
                        <div key={s} className="flex-1 flex items-center gap-1">
                          <div
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                              i <= stepIndex ? "bg-orange-500" : "bg-stone-100"
                            }`}
                          />
                          {i < STATUS_STEPS.length - 1 && null}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {STATUS_STEPS.map((s, i) => (
                        <span
                          key={s}
                          className={`text-[10px] font-medium transition-colors ${
                            i <= stepIndex ? "text-orange-500" : "text-stone-300"
                          }`}
                        >
                          {STATUS_CONFIG[s].label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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
                <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-xs text-stone-400">Total</span>
                  <span className="font-bold text-stone-900">${total.toFixed(2)}</span>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
