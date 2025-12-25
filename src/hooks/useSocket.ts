'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useNotificationStore } from '@/store/notificationStore';

interface UseSocketOptions {
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = { autoConnect: true }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { addNotification } = useNotificationStore();

  const connect = useCallback(() => {
    if (!session?.user?.id || socketRef.current?.connected) return;

    const newSocket = io({
      path: '/api/socket',
      auth: {
        token: session.user.id, // In production, use a proper JWT token
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // Handle notifications
    newSocket.on('notification', (notification) => {
      addNotification(notification);
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
        });
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session, addNotification]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoConnect && session?.user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [session, options.autoConnect, connect, disconnect]);

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
  };
}

// Order tracking hook
export function useOrderTracking(orderId: string) {
  const { socket, isConnected } = useSocket();
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !orderId) return;

    // Subscribe to order updates
    socket.emit('subscribe:order', orderId);
    socket.emit('subscribe:delivery', orderId);

    // Handle order status updates
    socket.on('order:status', (data) => {
      if (data.orderId === orderId) {
        setOrderStatus(data.status);
        setStatusMessage(data.message);
      }
    });

    // Handle delivery location updates
    socket.on('delivery:location', (data) => {
      if (data.orderId === orderId) {
        setDeliveryLocation(data.location);
      }
    });

    return () => {
      socket.emit('unsubscribe:order', orderId);
      socket.off('order:status');
      socket.off('delivery:location');
    };
  }, [socket, isConnected, orderId]);

  return {
    orderStatus,
    statusMessage,
    deliveryLocation,
    isConnected,
  };
}

// Admin real-time updates hook
export function useAdminRealtime() {
  const { socket, isConnected } = useSocket();
  const [newOrders, setNewOrders] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle new order notifications
    socket.on('admin:new-order', (data) => {
      setNewOrders((prev) => [data.order, ...prev].slice(0, 10));
      
      // Play notification sound
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {});
    });

    // Handle inventory alerts
    socket.on('admin:inventory-alert', (data) => {
      setInventoryAlerts((prev) => [data.product, ...prev].slice(0, 10));
    });

    return () => {
      socket.off('admin:new-order');
      socket.off('admin:inventory-alert');
    };
  }, [socket, isConnected]);

  const clearNewOrders = useCallback(() => {
    setNewOrders([]);
  }, []);

  const clearInventoryAlerts = useCallback(() => {
    setInventoryAlerts([]);
  }, []);

  return {
    newOrders,
    inventoryAlerts,
    isConnected,
    clearNewOrders,
    clearInventoryAlerts,
  };
}

// Chat hook for customer support
export function useChat(chatId: string) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket || !isConnected || !chatId) return;

    socket.emit('join:chat', chatId);

    // Handle incoming messages
    socket.on('chat:message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Handle typing indicators
    socket.on('chat:typing', (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => [...new Set([...prev, data.name])]);
      } else {
        setTypingUsers((prev) => prev.filter((name) => name !== data.name));
      }
    });

    return () => {
      socket.emit('leave:chat', chatId);
      socket.off('chat:message');
      socket.off('chat:typing');
    };
  }, [socket, isConnected, chatId]);

  const sendMessage = useCallback(
    (message: string) => {
      if (socket && isConnected) {
        socket.emit('chat:message', { chatId, message });
      }
    },
    [socket, isConnected, chatId]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (socket && isConnected) {
        socket.emit('chat:typing', { chatId, isTyping });
      }
    },
    [socket, isConnected, chatId]
  );

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    setTyping,
  };
}
