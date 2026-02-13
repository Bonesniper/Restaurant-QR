"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem } from "@/types";

type MenuItemCardProps = {
  item: MenuItem;
  quantityInCart: number;
  onAdd: (qty?: number) => void;
  onUpdateQuantity: (delta: number) => void;
};

export function MenuItemCard({
  item,
  quantityInCart,
  onAdd,
  onUpdateQuantity,
}: MenuItemCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const unavailable = !item.available;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col ${
        unavailable ? "opacity-75" : ""
      }`}
    >
      {unavailable && (
        <div className="absolute inset-0 bg-gray-900/40 z-10 rounded-xl flex items-center justify-center">
          <span className="bg-gray-800 text-white text-sm font-medium px-3 py-1 rounded-full">
            Unavailable
          </span>
        </div>
      )}

      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <Image
              src={item.imageUrl.startsWith("/") ? item.imageUrl : item.imageUrl}
              alt={item.name}
              fill
              className="object-cover transition-opacity duration-300"
              style={{ opacity: imageLoaded ? 1 : 0 }}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            🍽️
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 min-h-0">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-0.5 flex-1">
            {item.description}
          </p>
        )}
        <p className="text-amber-600 font-bold mt-1 text-sm sm:text-base">
          ${parseFloat(item.price).toFixed(2)}
        </p>

        <div className="mt-3">
          <AnimatePresence mode="wait">
            {quantityInCart === 0 ? (
              <motion.button
                key="add"
                type="button"
                disabled={unavailable}
                onClick={() => onAdd(1)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 active:scale-[0.98] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to cart
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-amber-500 bg-amber-50 py-1.5 px-2"
              >
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(-1)}
                  disabled={unavailable}
                  className="w-8 h-8 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center hover:bg-amber-600 active:scale-95 transition disabled:opacity-50"
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="min-w-[1.5rem] text-center font-bold text-gray-900">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(1)}
                  disabled={unavailable}
                  className="w-8 h-8 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center hover:bg-amber-600 active:scale-95 transition disabled:opacity-50"
                  aria-label="Increase"
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
