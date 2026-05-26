"use client";

export function MenuSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-5 animate-pulse">
      {/* Category tab bar skeleton */}
      <div className="flex gap-2 mb-6">
        {[80, 64, 96, 72].map((w, i) => (
          <div key={i} className="h-7 rounded-full bg-stone-200" style={{ width: w }} />
        ))}
      </div>

      {/* Section heading */}
      <div className="h-4 w-24 bg-stone-200 rounded mb-4" />

      {/* Item grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card border border-stone-100">
            <div className="aspect-[4/3] bg-stone-200" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 bg-stone-200 rounded-full w-3/4" />
              <div className="h-3 bg-stone-100 rounded-full w-full" />
              <div className="h-3 bg-stone-100 rounded-full w-2/3" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-3.5 bg-stone-200 rounded-full w-10" />
                <div className="h-6 w-12 bg-stone-200 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
