"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem } from "@/types";

type Props = {
  tableId: string;
  restaurantId: string;
  cart: CartItem[];
  totalItems: number;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onRemove: (menuItemId: string) => void;
};

export function CartSummary({
  tableId,
  restaurantId,
  cart,
  totalItems,
  drawerOpen,
  onDrawerOpenChange,
  onUpdateQuantity,
  onRemove,
}: Props) {
  const [checkout, setCheckout] = useState(false);
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  if (checkout) {
    return (
      <CheckoutFlow
        tableId={tableId}
        restaurantId={restaurantId}
        cart={cart}
        subtotal={subtotal}
        onBack={() => setCheckout(false)}
      />
    );
  }

  return (
    <>
      {/* Floating cart bar */}
      <AnimatePresence>
        {totalItems > 0 && !drawerOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-2 safe-bottom"
          >
            <button
              type="button"
              onClick={() => onDrawerOpenChange(true)}
              className="w-full max-w-lg mx-auto flex items-center justify-between px-5 py-4 rounded-2xl bg-stone-900 text-white shadow-xl hover:bg-stone-800 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-xs font-bold shrink-0">
                  {totalItems}
                </span>
                <span className="font-semibold text-sm">View cart</span>
              </div>
              <span className="font-bold text-orange-400">${subtotal.toFixed(2)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => onDrawerOpenChange(false)}
              className="fixed inset-0 z-30 bg-stone-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-sheet max-h-[88vh] flex flex-col"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-stone-200" />
              </div>

              {/* Header */}
              <div className="px-5 py-3 flex items-center justify-between shrink-0">
                <h2 className="text-base font-bold text-stone-900">
                  Your order
                  {cart.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-stone-400">
                      {totalItems} item{totalItems !== 1 ? "s" : ""}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={() => onDrawerOpenChange(false)}
                  className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3 opacity-30">🛒</div>
                    <p className="text-stone-400 text-sm font-medium">Your cart is empty</p>
                    <p className="text-stone-300 text-xs mt-1">Add items from the menu</p>
                  </div>
                ) : (
                  cart.map((c) => (
                    <motion.div
                      key={c.menuItemId}
                      layout
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 py-2.5 border-b border-stone-50 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 text-sm truncate">{c.name}</p>
                        <p className="text-stone-400 text-xs mt-0.5">
                          ${c.price.toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(c.menuItemId, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-stone-700 text-xs font-bold flex items-center justify-center shadow-sm hover:bg-stone-50 active:scale-90 transition-all"
                          >
                            −
                          </button>
                          <span className="min-w-[1.25rem] text-center font-bold text-sm text-stone-900">
                            {c.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(c.menuItemId, 1)}
                            className="w-6 h-6 rounded-lg bg-orange-500 text-white text-xs font-bold flex items-center justify-center hover:bg-orange-600 active:scale-90 transition-all"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-bold text-stone-900 min-w-[3.5rem] text-right">
                          ${(c.price * c.quantity).toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => onRemove(c.menuItemId)}
                          className="w-6 h-6 rounded-lg text-stone-300 hover:text-red-400 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="px-5 py-4 border-t border-stone-100 bg-white shrink-0 safe-bottom">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-stone-500 text-sm">Total</span>
                    <span className="text-xl font-bold text-stone-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onDrawerOpenChange(false);
                      setCheckout(true);
                    }}
                    className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 active:scale-[0.98] transition-all shadow-orange"
                  >
                    Checkout · ${subtotal.toFixed(2)}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Checkout flow ────────────────────────────────────────────────────────────

function CheckoutFlow({
  tableId,
  restaurantId,
  cart,
  subtotal,
  onBack,
}: {
  tableId: string;
  restaurantId: string;
  cart: CartItem[];
  subtotal: number;
  onBack: () => void;
}) {
  const [step, setStep] = useState<"choice" | "processing" | "done">("choice");
  const [paymentType, setPaymentType] = useState<"ONLINE" | "COUNTER" | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const placeOrder = async (type: "ONLINE" | "COUNTER") => {
    setPaymentType(type);
    setStep("processing");
    setPayError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          paymentType: type,
          items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity, unitPrice: c.price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      setOrderId(data.id);
      if (type === "ONLINE") {
        const payRes = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.id, simulateFailure: false }),
        });
        const payData = await payRes.json();
        if (!payData.success) setPayError("Payment failed — please pay at the counter.");
      }
      setStep("done");
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Something went wrong");
      setStep("choice");
    }
  };

  if (step === "processing") {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent"
        />
        <p className="text-stone-500 text-sm font-medium">Placing your order…</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mb-6"
        >
          ✓
        </motion.div>
        <h2 className="text-2xl font-bold text-stone-900 mb-1">Order placed!</h2>
        {payError ? (
          <p className="text-amber-600 text-sm mb-2">{payError}</p>
        ) : (
          <p className="text-stone-400 text-sm mb-2">
            {paymentType === "ONLINE" ? "Payment confirmed." : "Pay at the counter when ready."}
          </p>
        )}
        <p className="text-stone-300 text-xs mb-10">
          Order #{orderId?.slice(-6).toUpperCase()}
        </p>
        <div className="w-full max-w-xs space-y-3">
          <Link
            href={`/table/${tableId}/orders`}
            className="block w-full py-3.5 rounded-2xl bg-stone-900 text-white font-semibold text-sm text-center hover:bg-stone-800 transition-colors"
          >
            Track order status
          </Link>
          <Link
            href={`/table/${tableId}`}
            className="block w-full py-3.5 rounded-2xl bg-stone-100 text-stone-700 font-semibold text-sm text-center hover:bg-stone-200 transition-colors"
          >
            Back to menu
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-white overflow-y-auto"
    >
      <div className="max-w-lg mx-auto px-5 py-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 text-sm font-medium mb-6 hover:text-stone-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to cart
        </button>

        <h2 className="text-2xl font-bold text-stone-900 mb-1">Payment</h2>
        <p className="text-stone-400 text-sm mb-8">Total: <strong className="text-stone-900">${subtotal.toFixed(2)}</strong></p>

        {payError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {payError}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => placeOrder("COUNTER")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-stone-200 hover:border-stone-900 active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center text-xl transition-colors shrink-0">
              💵
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm">Pay at counter</p>
              <p className="text-stone-400 text-xs mt-0.5">Pay with cash or card when ready</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => placeOrder("ONLINE")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-stone-200 hover:border-orange-500 active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-xl transition-colors shrink-0">
              💳
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm">Pay online (mock)</p>
              <p className="text-stone-400 text-xs mt-0.5">Instant payment simulation</p>
            </div>
          </button>
        </div>

        {/* Order summary */}
        <div className="mt-8 pt-6 border-t border-stone-100">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Order summary</p>
          <div className="space-y-2">
            {cart.map((c) => (
              <div key={c.menuItemId} className="flex justify-between text-sm">
                <span className="text-stone-600">{c.name} × {c.quantity}</span>
                <span className="text-stone-900 font-medium">${(c.price * c.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-stone-100 font-bold">
            <span className="text-stone-900">Total</span>
            <span className="text-stone-900">${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
