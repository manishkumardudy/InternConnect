import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api, { BACKEND_URL } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null); // { message, type }

  const userId = user ? (user._id || user.userId || user.email) : null;

  // Load existing notifications when logged in
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Connect socket on login
  useEffect(() => {
    if (!userId || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || BACKEND_URL;
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected, joining room:', userId);
      newSocket.emit('join_room', userId);
    });

    newSocket.on('notification', (newNotif) => {
      // Prepend the new notification
      setNotifications((prev) => [newNotif, ...prev]);
      // Set toast message for UI popup
      setToast({
        id: Date.now(),
        message: newNotif.message,
        type: newNotif.type === 'new_application' ? 'info' : 'success'
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const markAsRead = async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const clearToast = () => setToast(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, toast, clearToast }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
