"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { MenuItemCard } from "./MenuItemCard";
import type { MenuCategory, MenuItem } from "@/types";

type MenuViewProps = {
  categories: MenuCategory[];
  cartQuantityByItemId: Record<string, number>;
  onAddToCart: (item: MenuItem, qty?: number) => void;
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
};

function getPopularItems(categories: MenuCategory[], max = 6): MenuItem[] {
  const flat: MenuItem[] = [];
  for (const cat of categories) {
    for (const item of cat.items) {
      flat.push(item);
      if (flat.length >= max) return flat;
    }
  }
  return flat;
}

export function MenuView({
  categories,
  cartQuantityByItemId,
  onAddToCart,
  onUpdateQuantity,
}: MenuViewProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const popularItems = getPopularItems(categories);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const categoryTabs = [
    { id: "popular", label: "Popular" },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Horizontal category bar */}
      <div className="sticky top-[3.5rem] z-[9] bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="overflow-x-auto scrollbar-hide px-4 py-3">
          <div className="flex gap-2 min-w-max pb-1">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id)}
                className="px-4 py-2 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-amber-100 hover:text-amber-800 whitespace-nowrap transition shrink-0"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-12">
        {/* Popular section */}
        {popularItems.length > 0 && (
          <section
            ref={(el) => {
              sectionRefs.current["popular"] = el;
            }}
            id="popular"
            className="scroll-mt-32"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Popular</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantityInCart={cartQuantityByItemId[item.id] ?? 0}
                  onAdd={(qty) => onAddToCart(item, qty)}
                  onUpdateQuantity={(delta) => onUpdateQuantity(item.id, delta)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Category sections */}
        {categories.map((cat) => (
          <section
            key={cat.id}
            ref={(el) => {
              sectionRefs.current[cat.id] = el;
            }}
            id={cat.id}
            className="scroll-mt-32"
          >
            <motion.h2
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold text-gray-900 mb-4"
            >
              {cat.name}
            </motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {cat.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantityInCart={cartQuantityByItemId[item.id] ?? 0}
                  onAdd={(qty) => onAddToCart(item, qty)}
                  onUpdateQuantity={(delta) => onUpdateQuantity(item.id, delta)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
