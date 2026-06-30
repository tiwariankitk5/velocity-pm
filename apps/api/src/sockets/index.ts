import type http from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

export function registerSockets(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true }
  });

  io.on("connection", (socket) => {
    socket.on("project:join", (projectId: string) => socket.join(`project:${projectId}`));
    socket.on("presence:update", (payload: { workspaceId: string; userId: string; status: "online" | "away" }) => {
      socket.to(`workspace:${payload.workspaceId}`).emit("presence:update", payload);
    });
    socket.on("chat:message", (payload: { workspaceId: string; body: string; authorId: string }) => {
      io.to(`workspace:${payload.workspaceId}`).emit("chat:message", { ...payload, createdAt: new Date().toISOString() });
    });
  });

  return io;
}
