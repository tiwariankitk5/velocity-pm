import type http from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { verifyAccessToken } from "../services/token.service.js";
import cookie from "cookie";

export function registerSockets(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) return next(new Error("Authentication error"));
      
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("project:join", (projectId: string) => {
      socket.join(`project:${projectId}`);
    });
    
    socket.on("workspace:join", (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
    });

    socket.on("presence:update", (payload: { workspaceId: string; status: "online" | "away" }) => {
      socket.to(`workspace:${payload.workspaceId}`).emit("presence:update", { 
        ...payload, 
        userId: socket.data.user.sub 
      });
    });

    socket.on("chat:message", (payload: { workspaceId: string; body: string }) => {
      io.to(`workspace:${payload.workspaceId}`).emit("chat:message", { 
        ...payload, 
        authorId: socket.data.user.sub,
        createdAt: new Date().toISOString() 
      });
    });
  });

  return io;
}
