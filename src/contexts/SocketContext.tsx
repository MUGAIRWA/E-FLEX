import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';

export interface NotificationItem {
  id?: string;
  _id?: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  link?: string;
  createdAt?: string;
}

interface Message {
  conversationId: string;
  [key: string]: any;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  messages: Message[];
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (messageData: any) => void;
  markNotificationAsRead: (id: string) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markMessagesAsRead: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, isAuthenticated } = useAuth();

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !localStorage.getItem('accessToken')) {
      setNotifications([]);
      return;
    }
    try {
      const response = await notificationAPI.getNotifications();
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user, refreshNotifications]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const envSocketUrl = (import.meta as any).env?.VITE_SOCKET_URL;
      const isProd = Boolean((import.meta as any).env?.PROD);

      // In production without an explicit persistent socket server (e.g. Vercel Serverless),
      // poll notifications every 15s instead of trying to connect to localhost:5000.
      if (isProd && !envSocketUrl) {
        const interval = window.setInterval(() => {
          refreshNotifications();
        }, 15000);
        return () => window.clearInterval(interval);
      }

      const socketUrl = envSocketUrl || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        auth: {
          token: localStorage.getItem('accessToken')
        }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('notification', (notification: NotificationItem) => {
        const item: NotificationItem = {
          id: notification.id || notification._id || `temp-${Date.now()}`,
          _id: notification._id || notification.id,
          title: notification.title || 'New Notification',
          message: notification.message || '',
          type: notification.type || 'info',
          isRead: Boolean(notification.isRead),
          link: notification.link || '',
          createdAt: notification.createdAt || new Date().toISOString()
        };
        setNotifications((prev) => [item, ...prev]);

        if ('Notification' in window && window.Notification.permission === 'granted') {
          new window.Notification(item.title, {
            body: item.message,
            icon: '/favicon.ico'
          });
        }
      });

      newSocket.on('new_message', (messageData) => {
        setMessages((prev) => [messageData, ...prev]);
        setNotifications((prev) => [
          {
            id: `msg-${Date.now()}`,
            title: `New message from ${messageData?.sender?.firstName || 'User'}`,
            message: messageData?.message?.content || 'You received a new message',
            type: 'info',
            isRead: false,
            link: 'messages',
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
      });

      newSocket.on('assignment_created', (data) => {
        refreshNotifications();
      });

      newSocket.on('assignment_graded', (data) => {
        refreshNotifications();
      });

      newSocket.on('attendance_marked', (data) => {
        refreshNotifications();
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user, refreshNotifications]);

  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
    }
  };

  const sendMessage = (messageData: any) => {
    if (socket && isConnected) {
      socket.emit('send_message', messageData);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id || n._id === id ? { ...n, isRead: true } : n))
    );
    if (!id.startsWith('temp-') && !id.startsWith('msg-')) {
      try {
        await notificationAPI.markAsRead(id);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  const markNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationAPI.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
    if (!id.startsWith('temp-') && !id.startsWith('msg-')) {
      try {
        await notificationAPI.deleteNotification(id);
      } catch (err) {
        console.error('Failed to delete notification:', err);
      }
    }
  };

  const markMessagesAsRead = (conversationId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.conversationId !== conversationId));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    messages,
    joinRoom,
    leaveRoom,
    sendMessage,
    markNotificationAsRead,
    markNotificationsAsRead,
    deleteNotification,
    refreshNotifications,
    markMessagesAsRead
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
