"use client";

import { useEffect, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_PATH = "/api/socket";

export function useNewOrders(
  restaurantId: string | null,
  onNewOrder: (order: unknown) => void
) {
  const stableOnNewOrder = useCallback(onNewOrder, []);
  useEffect(() => {
    if (!restaurantId) return;
    const socket = io({ path: SOCKET_PATH, addTrailingSlash: false });
    socket.on("connect", () => socket.emit("join-dashboard", restaurantId));
    socket.on("new-order", stableOnNewOrder);
    return () => {
      socket.off("new-order", stableOnNewOrder);
      socket.disconnect();
    };
  }, [restaurantId, stableOnNewOrder]);
}
