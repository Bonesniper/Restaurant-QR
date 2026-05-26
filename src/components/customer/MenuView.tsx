"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MenuItemCard } from "./MenuItemCard";
import type { MenuCategory, MenuItem } from "@/types";

type Props = {
  categories: MenuCategory[];
  cartQuantityByItemId: Record<string, number>;
  onAddToCart: (item: MenuItem, qty?: number) => void;
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
};

export function MenuView({ categories, cartQuantityByItemId, onAddToCart, onUpdateQuantity }: Props) {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeId, setActiveId] = useState<string>("");

  const allItems = categories.flatMap((c) => c.items);
  const showFeatured = categories.length > 1 && allItems.length >= 4;
  const featuredItems = allItems.slice(0, 6);

  const tabs = [
    ...(showFeatured ? [{ id: "featured", label: "Featured" }] : []),
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ];

  useEffect(() => {
    if (tabs.length && !activeId) setActiveId(tabs[0].id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length]);

  useEffect(() => {
    const ids = tabs.map((t) => t.id);
    const observers = ids.map((id) => {
      const el = sectionRefs.current[id];
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: "-30% 0px -65% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => { observers.forEach((o) => o?.disconnect()); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const scrollTo = (id: string) => {
    setActiveId(id);
    const el = sectionRefs.current[id];
    if (!el) return;
    const offset = 96; // header + category bar height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Category tabs */}
      <div className="sticky top-[3.25rem] z-[9] bg-white border-b border-stone-100">
        <div className="overflow-x-auto scrollbar-hide px-4 py-2.5">
          <div className="flex gap-1.5 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollTo(tab.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeId === tab.id
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 py-5 space-y-10">
        {showFeatured && (
          <section
            ref={(el) => { sectionRefs.current["featured"] = el; }}
            id="featured"
            className="scroll-mt-28"
          >
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-base font-bold text-stone-900">Featured</h2>
              <span className="text-xs text-stone-400">{featuredItems.length} items</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {featuredItems.map((item) => (
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

        {categories.map((cat, i) => (
          <section
            key={cat.id}
            ref={(el) => { sectionRefs.current[cat.id] = el; }}
            id={cat.id}
            className="scroll-mt-28"
          >
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-baseline justify-between mb-4"
            >
              <h2 className="text-base font-bold text-stone-900">{cat.name}</h2>
              <span className="text-xs text-stone-400">{cat.items.length} items</span>
            </motion.div>

            {cat.items.length === 0 ? (
              <p className="text-sm text-stone-400 py-6 text-center">No items yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
            )}
          </section>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-400 text-sm">Menu coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
