"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_PATH = "/api/socket";

export function useNewOrders(
  restaurantId: string | null,
  onNewOrder: (order: unknown) => void
) {
  const callbackRef = useRef(onNewOrder);
  useEffect(() => {
    callbackRef.current = onNewOrder;
  });

  useEffect(() => {
    if (!restaurantId) return;
    const socket = io({ path: SOCKET_PATH, addTrailingSlash: false });
    socket.on("connect", () => socket.emit("join-dashboard", restaurantId));
    socket.on("new-order", (order) => callbackRef.current(order));
    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);
}
