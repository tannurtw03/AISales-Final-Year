import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [lastDashboardUpdate, setLastDashboardUpdate] = useState(Date.now());

  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[Socket.IO] Connected to backend server:', newSocket.id);
    });

    newSocket.on('new_sale', (data) => {
      addToast('sale', data.notification?.title || 'New Sale Recorded', data.notification?.message || 'A new transaction was logged.');
      setUnreadNotifsCount((prev) => prev + 1);
      setLastDashboardUpdate(Date.now());
    });

    newSocket.on('stock_alert', (data) => {
      addToast('stock', data.notification?.title || 'Stock Threshold Alert', data.notification?.message || 'Product stock is running low.');
      setUnreadNotifsCount((prev) => prev + 1);
      setLastDashboardUpdate(Date.now());
    });

    newSocket.on('prediction_completed', (data) => {
      addToast('prediction', data.notification?.title || 'AI Forecast Complete', data.notification?.message || 'New sales forecast is ready.');
      setUnreadNotifsCount((prev) => prev + 1);
      setLastDashboardUpdate(Date.now());
    });

    newSocket.on('target_achieved', (data) => {
      addToast('target', data.notification?.title || 'Sales Target Achieved', data.notification?.message || 'Sales goal accomplished!');
      setUnreadNotifsCount((prev) => prev + 1);
      setLastDashboardUpdate(Date.now());
    });

    newSocket.on('dashboard_update', () => {
      setLastDashboardUpdate(Date.now());
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        toasts,
        addToast,
        removeToast,
        unreadNotifsCount,
        setUnreadNotifsCount,
        lastDashboardUpdate
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
