"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_PATH = "/api/socket";

export function useOrderStatusUpdates(
  tableId: string | null,
  onStatus: (payload: { orderId: string; status: string }) => void
) {
  useEffect(() => {
    if (!tableId) return;
    const socket = io({ path: SOCKET_PATH, addTrailingSlash: false });
    socket.on("connect", () => socket.emit("join-table", tableId));
    socket.on("order-status", onStatus);
    return () => {
      socket.off("order-status", onStatus);
      socket.disconnect();
    };
  }, [tableId, onStatus]);
}
