"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem } from "@/types";

type Props = {
  item: MenuItem;
  quantityInCart: number;
  onAdd: (qty?: number) => void;
  onUpdateQuantity: (delta: number) => void;
};

export function MenuItemCard({ item, quantityInCart, onAdd, onUpdateQuantity }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const unavailable = !item.available;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-2xl overflow-hidden shadow-card border border-stone-100 flex flex-col ${
        unavailable ? "opacity-55" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {item.imageUrl ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 bg-stone-200 animate-pulse" />}
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className={`object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl opacity-30">🍽</span>
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
            <span className="bg-white/90 text-stone-700 text-xs font-semibold px-3 py-1 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="font-semibold text-stone-900 text-sm leading-snug line-clamp-1">
          {item.name}
        </p>
        {item.description && (
          <p className="text-stone-400 text-xs leading-relaxed line-clamp-2 flex-1">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-1 gap-1">
          <span className="font-bold text-orange-500 text-sm">
            ${parseFloat(item.price).toFixed(2)}
          </span>

          <AnimatePresence mode="wait">
            {quantityInCart === 0 ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.12 }}
                type="button"
                disabled={unavailable}
                onClick={() => onAdd(1)}
                className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-1"
              >
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(-1)}
                  className="w-6 h-6 rounded-lg bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-center hover:bg-stone-200 active:scale-90 transition-all"
                >
                  −
                </button>
                <span className="min-w-[1.1rem] text-center font-bold text-xs text-stone-900">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(1)}
                  className="w-6 h-6 rounded-lg bg-orange-500 text-white text-xs font-bold flex items-center justify-center hover:bg-orange-600 active:scale-90 transition-all"
                >
                  +
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
