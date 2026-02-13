import { Server as SocketIOServer } from "socket.io";

declare global {
  var io: SocketIOServer | undefined;
}

export function getIO(): SocketIOServer | undefined {
  return global.io;
}
