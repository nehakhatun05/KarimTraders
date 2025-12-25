import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface ServerWithIO extends HTTPServer {
  io?: SocketIOServer;
}

export interface SocketUser {
  userId: string;
  name: string;
  role: string;
}

const connectedUsers = new Map<string, string[]>(); // userId -> socketIds[]

export function initializeSocket(server: ServerWithIO) {
  if (server.io) {
    console.log('Socket.io already initialized');
    return server.io;
  }

  const io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as SocketUser;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;
    console.log(`User connected: ${user.userId}`);

    // Track connected user
    const userSockets = connectedUsers.get(user.userId) || [];
    userSockets.push(socket.id);
    connectedUsers.set(user.userId, userSockets);

    // Join user-specific room
    socket.join(`user:${user.userId}`);

    // Admin joins admin room
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      socket.join('admin');
    }

    // Handle order status subscription
    socket.on('subscribe:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`User ${user.userId} subscribed to order: ${orderId}`);
    });

    socket.on('unsubscribe:order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });

    // Handle delivery tracking
    socket.on('subscribe:delivery', (orderId: string) => {
      socket.join(`delivery:${orderId}`);
    });

    socket.on('update:delivery-location', (data: { orderId: string; lat: number; lng: number }) => {
      // Only delivery personnel can update location
      if (user.role === 'DELIVERY') {
        io.to(`delivery:${data.orderId}`).emit('delivery:location', {
          orderId: data.orderId,
          location: { lat: data.lat, lng: data.lng },
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle typing indicators for support chat
    socket.on('chat:typing', (data: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.chatId}`).emit('chat:typing', {
        userId: user.userId,
        name: user.name,
        isTyping: data.isTyping,
      });
    });

    // Handle support chat messages
    socket.on('chat:message', (data: { chatId: string; message: string }) => {
      io.to(`chat:${data.chatId}`).emit('chat:message', {
        userId: user.userId,
        name: user.name,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.userId}`);
      
      const userSockets = connectedUsers.get(user.userId) || [];
      const updatedSockets = userSockets.filter(id => id !== socket.id);
      
      if (updatedSockets.length === 0) {
        connectedUsers.delete(user.userId);
      } else {
        connectedUsers.set(user.userId, updatedSockets);
      }
    });
  });

  server.io = io;
  return io;
}

// Helper functions for emitting events

export function emitOrderStatusUpdate(
  io: SocketIOServer,
  orderId: string,
  userId: string,
  status: string,
  message: string
) {
  io.to(`order:${orderId}`).to(`user:${userId}`).emit('order:status', {
    orderId,
    status,
    message,
    timestamp: new Date().toISOString(),
  });
}

export function emitNotification(
  io: SocketIOServer,
  userId: string,
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }
) {
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
}

export function emitNewOrder(io: SocketIOServer, order: any) {
  io.to('admin').emit('admin:new-order', {
    order,
    timestamp: new Date().toISOString(),
  });
}

export function emitInventoryAlert(
  io: SocketIOServer,
  product: { id: string; name: string; stockCount: number }
) {
  io.to('admin').emit('admin:inventory-alert', {
    product,
    timestamp: new Date().toISOString(),
  });
}

export function getOnlineUsers(): string[] {
  return Array.from(connectedUsers.keys());
}

export function isUserOnline(userId: string): boolean {
  return connectedUsers.has(userId);
}
