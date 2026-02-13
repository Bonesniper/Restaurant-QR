"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MenuView } from "@/components/customer/MenuView";
import { CartSummary } from "@/components/customer/CartSummary";
import { MenuSkeleton } from "@/components/customer/MenuSkeleton";
import type { TableWithRestaurant } from "@/types";
import type { MenuCategory, MenuItem } from "@/types";
import type { CartItem } from "@/types";

export default function TablePage() {
  const params = useParams();
  const tableId = params?.tableId as string;
  const [table, setTable] = useState<TableWithRestaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) return;
    (async () => {
      try {
        const tableRes = await fetch(`/api/tables/${tableId}`);
        if (!tableRes.ok) {
          const data = await tableRes.json().catch(() => ({}));
          setError(data.error || "Table not found");
          setLoading(false);
          return;
        }
        const tableData = await tableRes.json();
        setTable(tableData);
        const menuRes = await fetch(`/api/restaurants/${tableData.restaurant.id}/menu`);
        const menuData = menuRes.ok ? await menuRes.json() : [];
        setCategories(menuData);
      } catch (e) {
        setError("Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [tableId]);

  const addToCart = useCallback((item: MenuItem, qty = 1) => {
    const price = parseFloat(item.price);
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + qty } : c
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price,
          quantity: qty,
          imageUrl: item.imageUrl,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((c) => c.menuItemId === menuItemId);
      if (!item) return prev;
      const next = item.quantity + delta;
      if (next <= 0) return prev.filter((c) => c.menuItemId !== menuItemId);
      return prev.map((c) =>
        c.menuItemId === menuItemId ? { ...c, quantity: next } : c
      );
    });
  }, []);

  const removeFromCart = useCallback((menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  }, []);

  const cartQuantityByItemId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cart) map[c.menuItemId] = c.quantity;
    return map;
  }, [cart]);

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-amber-100 px-4 py-3">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="h-8 w-32 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 rounded bg-gray-200 animate-pulse" />
          </div>
        </header>
        <MenuSkeleton />
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-amber-50">
        <p className="text-red-600">{error || "Table not found"}</p>
        <Link href="/" className="text-amber-600 font-medium">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-28 safe-bottom">
      {/* Top: logo, table number, sticky cart button */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {table.restaurant.logoUrl ? (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-amber-100">
                <Image
                  src={
                    table.restaurant.logoUrl.startsWith("/")
                      ? table.restaurant.logoUrl
                      : table.restaurant.logoUrl
                  }
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-lg shrink-0">
                🍴
              </div>
            )}
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {table.restaurant.name}
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              Table {table.label}
            </span>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-amber-500 text-white font-bold shadow-md hover:bg-amber-600 active:scale-[0.98] transition"
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">
                {totalItems}
              </span>
              <span className="hidden sm:inline">${subtotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <MenuView
          categories={categories}
          cartQuantityByItemId={cartQuantityByItemId}
          onAddToCart={addToCart}
          onUpdateQuantity={updateQuantity}
        />
      </main>

      <CartSummary
        tableId={tableId}
        restaurantId={table.restaurant.id}
        cart={cart}
        totalItems={totalItems}
        drawerOpen={drawerOpen}
        onDrawerOpenChange={setDrawerOpen}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}
