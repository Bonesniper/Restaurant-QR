"use client";

import { motion } from "framer-motion";

export function MenuSkeleton() {
  return (
    <div className="animate-pulse max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-2 overflow-hidden mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 rounded-xl bg-gray-200 flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
          >
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-9 bg-gray-200 rounded-xl w-full mt-2" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
