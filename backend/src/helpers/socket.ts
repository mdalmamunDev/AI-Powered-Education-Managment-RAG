import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { prisma } from '../../prisma/prisma';

// Socket.IO shares the same HTTP server/port as the REST API and uses the
// same JWT, so the chat worker can push stage + token updates straight to a
// specific user's private room (`user:{id}`).
let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Authenticate the handshake with the same Bearer token the API accepts.
  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string) ||
        (socket.handshake.query?.token as string);
      if (!token) return next(new Error('unauthorized'));

      const verified = jwt.verify(token, process.env.JWT_SECRET as Secret) as JwtPayload;
      const user = await prisma.user.findUnique({ where: { id: verified.id } });
      if (!user) return next(new Error('unauthorized'));

      socket.data.userId = user.id;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.userId}`);
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO is not initialized');
  return io;
}

// Best-effort emit: silently no-ops if the socket layer isn't up.
export function emitToUser(userId: number, event: string, payload: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}