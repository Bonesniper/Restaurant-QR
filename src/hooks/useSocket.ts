"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_PATH = "/api/socket";

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      path: SOCKET_PATH,
      addTrailingSlash: false,
    });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { socket: socketRef.current, connected };
}

export function useSocketTable(tableId: string | null) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!tableId) return;
    const socket = io({ path: SOCKET_PATH, addTrailingSlash: false });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-table", tableId);
    });
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tableId]);

  return { socket: socketRef.current, connected };
}

export function useSocketDashboard(restaurantId: string | null) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    const socket = io({ path: SOCKET_PATH, addTrailingSlash: false });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-dashboard", restaurantId);
    });
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [restaurantId]);

  return { socket: socketRef.current, connected };
}
