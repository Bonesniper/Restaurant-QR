"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useOrderStatusUpdates } from "@/hooks/useOrderStatus";
import type { Order, OrderStatus } from "@/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready for pickup",
  SERVED: "Served",
  COMPLETED: "Completed",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PREPARING: "bg-blue-100 text-blue-800",
  READY: "bg-green-100 text-green-800",
  SERVED: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-gray-100 text-gray-800",
};

export default function TableOrdersPage() {
  const params = useParams();
  const tableId = params?.tableId as string;
  const [table, setTable] = useState<{ label: string; restaurant: { name: string } } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!tableId) return;
    const res = await fetch(`/api/orders?tableId=${tableId}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  }, [tableId]);

  useEffect(() => {
    if (!tableId) return;
    (async () => {
      const tableRes = await fetch(`/api/tables/${tableId}`);
      if (tableRes.ok) {
        const tableData = await tableRes.json();
        setTable(tableData);
      }
      await fetchOrders();
      setLoading(false);
    })();
  }, [tableId, fetchOrders]);

  useOrderStatusUpdates(tableId, useCallback(({ orderId, status }) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }, []));

  useEffect(() => {
    if (!tableId) return;
    const t = setInterval(fetchOrders, 10000);
    return () => clearInterval(t);
  }, [tableId, fetchOrders]);

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-gray-600">Loading orders…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-8">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-amber-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href={`/table/${tableId}`} className="text-amber-600 font-medium">
            ← Menu
          </Link>
          <h1 className="text-lg font-bold text-gray-800">
            {table?.restaurant?.name ?? "Orders"}
          </h1>
          <span className="text-sm text-gray-500">Table {table?.label ?? tableId}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden"
            >
              <div className="p-4 flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="font-medium">
                    Payment: {order.paymentType === "ONLINE" ? "Online" : "At counter"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    STATUS_COLORS[order.status as OrderStatus] ?? "bg-gray-100"
                  }`}
                >
                  {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                </span>
              </div>
              <ul className="border-t border-amber-100 divide-y divide-amber-50">
                {order.items.map((oi) => (
                  <li key={oi.id} className="px-4 py-2 flex justify-between text-sm">
                    <span>
                      {oi.menuItem.name} × {oi.quantity}
                    </span>
                    <span>${(Number(oi.unitPrice) * oi.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 bg-amber-50 flex justify-between font-medium">
                <span>Total</span>
                <span>
                  $
                  {order.items
                    .reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
                    .toFixed(2)}
                </span>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  );
}
