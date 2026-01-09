/**
 * WebSocket Provider
 * Manages WebSocket connection and provides real-time updates
 */

import { useEffect, useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { wsService } from '../../services/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  joinRepository: (repositoryId: string) => void;
  leaveRepository: (repositoryId: string) => void;
  on: (event: string, callback: Function) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    wsService.connect();

    // Listen for connection state changes
    const unsubscribeConnected = wsService.on('connected', () => {
      setIsConnected(true);
    });

    const unsubscribeDisconnected = wsService.on('disconnected', () => {
      setIsConnected(false);
    });

    // Check initial connection state
    setIsConnected(wsService.isConnected());

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      wsService.disconnect();
    };
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    joinRepository: (repositoryId: string) => wsService.joinRepository(repositoryId),
    leaveRepository: (repositoryId: string) => wsService.leaveRepository(repositoryId),
    on: (event: string, callback: Function) => wsService.on(event, callback),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
