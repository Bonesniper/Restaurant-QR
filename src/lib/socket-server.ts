import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export function initSocketServer(httpServer: NetServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join-table", (tableId: string) => {
      socket.join(`table:${tableId}`);
    });
    socket.on("join-restaurant", (restaurantId: string) => {
      socket.join(`restaurant:${restaurantId}`);
    });
    socket.on("join-dashboard", (restaurantId: string) => {
      socket.join(`dashboard:${restaurantId}`);
    });
  });

  return io;
}

export function emitNewOrder(restaurantId: string, order: unknown): void {
  io?.to(`dashboard:${restaurantId}`).to(`restaurant:${restaurantId}`).emit("new-order", order);
}

export function emitOrderStatus(tableId: string, orderId: string, status: string): void {
  io?.to(`table:${tableId}`).emit("order-status", { orderId, status });
}
