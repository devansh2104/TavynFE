import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected' | 'connecting' | 'disconnected'
  const [lastEvent, setLastEvent] = useState(null);
  const [eventLog, setEventLog] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);

  const alertTimerRef = useRef(null);

  useEffect(() => {
    console.log('[WebSocket] Initializing connection to:', SOCKET_URL);
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('⚡ [WebSocket] Connected with ID:', newSocket.id);
      setIsConnected(true);
      setConnectionStatus('connected');
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('🔌 [WebSocket] Disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [WebSocket] Connection error:', error.message);
      setIsConnected(false);
      setConnectionStatus('error');
    });

    // Listen for real-time dashboard events from server
    newSocket.on('dashboard_update', (payload) => {
      console.log('📡 [WebSocket] Received dashboard_update:', payload);
      
      const formattedEvent = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: payload.type || 'DATA_SYNC',
        message: payload.message || getDefaultMessage(payload.type, payload),
        timestamp: payload.timestamp || new Date().toISOString(),
        payload: payload,
      };

      setLastEvent(formattedEvent);
      setEventLog((prev) => [formattedEvent, ...prev.slice(0, 24)]);

      // Trigger active transient notification banner
      setActiveAlert(formattedEvent);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        setActiveAlert(null);
      }, 5000);
    });

    setSocket(newSocket);

    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      newSocket.disconnect();
    };
  }, []);

  // Format human-friendly descriptions for known event types
  const getDefaultMessage = (type, data) => {
    switch (type) {
      case 'PAYMENT_RECEIVED':
        return data?.payment?.amount 
          ? `Payment of ₹${Number(data.payment.amount).toLocaleString()} recorded` 
          : 'Rent payment received and ledger updated';
      case 'TENANT_ADDED':
        return data?.tenant?.name 
          ? `Resident ${data.tenant.name} newly enrolled` 
          : 'New resident enrollment recorded';
      case 'TENANT_CHECKOUT':
        return 'Resident checked out and room vacated';
      case 'RENT_GENERATED':
        return data?.count 
          ? `Generated ${data.count} monthly rent invoices` 
          : 'Monthly rent cycle invoices generated';
      case 'ELECTRICITY_LOGGED':
        return 'Electricity submeter reading logged';
      case 'EXPENSE_ADDED':
        return data?.expense?.amount 
          ? `Hostel expense of ₹${Number(data.expense.amount).toLocaleString()} added` 
          : 'New hostel expense recorded';
      case 'BED_UPDATED':
      case 'ROOM_UPDATED':
        return 'Room or bed allocation updated';
      case 'LIVE_SYNC':
      case 'LIVE_PING':
        return 'Live real-time WebSocket sync broadcast';
      default:
        return 'Dashboard metrics and allocations updated in real-time';
    }
  };

  // Helper to send a ping or simulate event over the socket
  const sendPing = useCallback((type = 'LIVE_PING', customMessage) => {
    if (socket && socket.connected) {
      socket.emit('ping_dashboard', {
        type,
        message: customMessage || `Manual real-time ping sent at ${new Date().toLocaleTimeString()}`,
      });
      return true;
    }
    return false;
  }, [socket]);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectionStatus,
        lastEvent,
        eventLog,
        activeAlert,
        dismissAlert,
        sendPing,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
