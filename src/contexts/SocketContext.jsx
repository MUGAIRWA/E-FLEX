import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
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

  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
    }
  };

  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('send_message', messageData);
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications([]);
  };

  const markMessagesAsRead = (conversationId) => {
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
