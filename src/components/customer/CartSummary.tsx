"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem } from "@/types";

type CartSummaryProps = {
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
}: CartSummaryProps) {
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
      {/* Floating mini cart - sticky at bottom when cart has items */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.button
            type="button"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={() => setDrawerOpen(true)}
            className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-20 py-4 px-6 rounded-2xl bg-amber-500 text-white font-bold shadow-xl flex items-center justify-between safe-bottom hover:bg-amber-600 active:scale-[0.98] transition"
          >
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                {totalItems}
              </span>
              View cart
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide-up cart drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onDrawerOpenChange(false)}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-gray-900">Your order</h2>
                <button
                  type="button"
                  onClick={() => onDrawerOpenChange(false)}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium">Your cart is empty</p>
                    <p className="text-sm mt-1">Add items from the menu to get started.</p>
                  </div>
                ) : (
                cart.map((c) => (
                  <motion.div
                    key={c.menuItemId}
                    layout
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-sm text-gray-500">
                        ${c.price.toFixed(2)} × {c.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(c.menuItemId, -1)}
                        className="w-9 h-9 rounded-xl border-2 border-amber-400 text-amber-600 font-bold hover:bg-amber-50 transition"
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center font-bold">{c.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(c.menuItemId, 1)}
                        className="w-9 h-9 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(c.menuItemId)}
                        className="text-red-500 text-sm font-medium hover:underline ml-1"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))
                )}
              </div>
              <div className="p-4 border-t border-gray-100 bg-amber-50/50 shrink-0 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Order total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {cart.length > 0 && (
                  <>
                    <p className="text-sm text-gray-600">Choose payment at checkout.</p>
                    <button
                      type="button"
                      onClick={() => {
                        onDrawerOpenChange(false);
                        setCheckout(true);
                      }}
                      className="w-full py-4 rounded-xl bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 active:scale-[0.99] transition shadow-md"
                    >
                      Checkout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

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
  const [step, setStep] = useState<"payment-choice" | "paying" | "done">("payment-choice");
  const [paymentType, setPaymentType] = useState<"ONLINE" | "COUNTER" | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const placeOrder = async (type: "ONLINE" | "COUNTER") => {
    setPaymentType(type);
    setStep("paying");
    setPayError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          paymentType: type,
          items: cart.map((c) => ({
            menuItemId: c.menuItemId,
            quantity: c.quantity,
            unitPrice: c.price,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      const oid = data.id;
      setOrderId(oid);
      if (type === "ONLINE") {
        const payRes = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: oid, simulateFailure: false }),
        });
        const payData = await payRes.json();
        if (!payData.success) {
          setPayError("Payment failed. Your order was placed; please pay at counter.");
        }
      }
      setStep("done");
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  if (step === "payment-choice") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-30 bg-white overflow-y-auto"
      >
        <div className="p-6 max-w-lg mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="text-amber-600 font-semibold mb-6 flex items-center gap-2"
          >
            ← Back to cart
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose payment</h2>
          <p className="text-gray-600 mb-8">Total: ${subtotal.toFixed(2)}</p>
          <div className="space-y-4">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => placeOrder("ONLINE")}
              className="w-full py-4 rounded-xl border-2 border-amber-500 text-amber-700 font-semibold hover:bg-amber-50 transition"
            >
              Pay online (mock)
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => placeOrder("COUNTER")}
              className="w-full py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Pay at counter
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (step === "paying") {
    return (
      <div className="fixed inset-0 z-30 bg-white flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-gray-600 font-medium"
        >
          Placing order…
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-30 bg-white overflow-y-auto"
    >
      <div className="p-6 max-w-lg mx-auto text-center min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mb-6"
        >
          ✓
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order placed</h2>
        {payError && <p className="text-amber-600 mb-4">{payError}</p>}
        <p className="text-gray-600 mb-8">Order #{orderId?.slice(-6).toUpperCase()}</p>
        <Link
          href={`/table/${tableId}/orders`}
          className="block w-full py-4 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition mb-3"
        >
          View order status
        </Link>
        <Link
          href={`/table/${tableId}`}
          className="block text-amber-600 font-semibold hover:underline"
        >
          Back to menu
        </Link>
      </div>
    </motion.div>
  );
}
