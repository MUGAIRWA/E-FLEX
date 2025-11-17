import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Notification {
  title: string;
  message: string;
  // Add other notification properties as needed
}

interface Message {
  conversationId: string;
  // Add other message properties as needed
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  messages: Message[];
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (messageData: any) => void;
  markNotificationsAsRead: () => void;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('accessToken')
        }
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Notification events
      newSocket.on('notification', (notification) => {
        console.log('New notification:', notification);
        setNotifications(prev => [notification, ...prev]);

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      });

      // Message events
      newSocket.on('new_message', (messageData) => {
        console.log('New message:', messageData);
        setMessages(prev => [messageData, ...prev]);
      });

      // Assignment events
      newSocket.on('assignment_created', (data) => {
        console.log('New assignment:', data);
        // Handle assignment notification
      });

      newSocket.on('assignment_graded', (data) => {
        console.log('Assignment graded:', data);
        // Handle grade notification
      });

      // Attendance events
      newSocket.on('attendance_marked', (data) => {
        console.log('Attendance marked:', data);
        // Handle attendance notification
      });

      // Announcement events
      newSocket.on('announcement', (data) => {
        console.log('New announcement:', data);
        // Handle announcement notification
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
  }, [isAuthenticated, user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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

  const markNotificationsAsRead = () => {
    setNotifications([]);
  };

  const markMessagesAsRead = (conversationId: string) => {
    setMessages(prev => prev.filter(msg => msg.conversationId !== conversationId));
  };

  const value = {
    socket,
    isConnected,
    notifications,
    messages,
    joinRoom,
    leaveRoom,
    sendMessage,
    markNotificationsAsRead,
    markMessagesAsRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
