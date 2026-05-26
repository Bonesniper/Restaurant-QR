"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuView } from "@/components/customer/MenuView";
import { CartSummary } from "@/components/customer/CartSummary";
import { MenuSkeleton } from "@/components/customer/MenuSkeleton";
import type { TableWithRestaurant, MenuCategory, MenuItem, CartItem } from "@/types";

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
          const d = await tableRes.json().catch(() => ({}));
          setError(d.error || "Table not found");
          setLoading(false);
          return;
        }
        const tableData = await tableRes.json();
        setTable(tableData);
        const menuRes = await fetch(`/api/restaurants/${tableData.restaurant.id}/menu`);
        setCategories(menuRes.ok ? await menuRes.json() : []);
      } catch {
        setError("Failed to load menu");
      } finally {
        setLoading(false);
      }
    })();
  }, [tableId]);

  const addToCart = useCallback((item: MenuItem, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) return prev.map((c) => c.menuItemId === item.id ? { ...c, quantity: c.quantity + qty } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: parseFloat(item.price), quantity: qty, imageUrl: item.imageUrl }];
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((c) => c.menuItemId === menuItemId);
      if (!item) return prev;
      const next = item.quantity + delta;
      if (next <= 0) return prev.filter((c) => c.menuItemId !== menuItemId);
      return prev.map((c) => c.menuItemId === menuItemId ? { ...c, quantity: next } : c);
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
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-10 bg-white border-b border-stone-100 px-4 py-3.5">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="h-5 w-36 rounded-full bg-stone-100 animate-pulse" />
            <div className="h-8 w-20 rounded-full bg-stone-100 animate-pulse" />
          </div>
        </header>
        <MenuSkeleton />
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-xl">!</div>
        <p className="text-stone-600 font-medium">{error || "Table not found"}</p>
        <Link href="/" className="text-orange-500 text-sm font-medium hover:underline">Go home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-stone-100">
        <div className="flex items-center justify-between max-w-4xl mx-auto px-4 py-3">
          {/* Restaurant identity */}
          <div className="flex items-center gap-3 min-w-0">
            {table.restaurant.logoUrl ? (
              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                <Image src={table.restaurant.logoUrl} alt="" fill className="object-cover" sizes="32px" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">
                  {table.restaurant.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-stone-900 text-sm truncate leading-tight">
                {table.restaurant.name}
              </p>
              <p className="text-stone-400 text-xs">Table {table.label}</p>
            </div>
          </div>

          {/* Cart button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              totalItems > 0
                ? "bg-orange-500 text-white shadow-orange hover:bg-orange-600 active:scale-[0.97]"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {totalItems > 0 ? (
              <span>{totalItems} · ${subtotal.toFixed(2)}</span>
            ) : (
              <span>Cart</span>
            )}
          </button>
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
