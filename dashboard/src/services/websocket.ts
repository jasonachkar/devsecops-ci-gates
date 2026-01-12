/**
 * @fileoverview WebSocket Client Service
 * @description Manages WebSocket connection to backend for real-time updates.
 * Handles connection lifecycle, event forwarding, and repository room management.
 * Provides a clean API for components to subscribe to real-time events.
 * 
 * @module services/websocket
 */

import { io, Socket } from 'socket.io-client';

/** WebSocket server URL from environment or default */
// Derive WebSocket URL from API base URL by removing /api/v1 suffix
const WS_URL = import.meta.env.VITE_WS_URL ||
  (import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1$/, '') || 'http://localhost:3001');

/**
 * WebSocket Service Class
 * @class WebSocketService
 * @description Singleton service for managing WebSocket connections
 * Provides event subscription/unsubscription and room management
 */
class WebSocketService {
  /** Active Socket.IO connection instance */
  private socket: Socket | null = null;
  
  /** Map of event names to sets of callback functions */
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Establish WebSocket connection to backend
   * @method connect
   * @returns {void}
   * @description Creates Socket.IO connection with automatic reconnection.
   * Sets up event handlers and forwards all events to registered listeners.
   * Idempotent - won't create duplicate connections.
   */
  connect() {
    // Don't create new connection if already connected
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('🔌 Attempting to connect to WebSocket at:', WS_URL);
    
    // Create Socket.IO connection
    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      reconnection: true, // Automatically reconnect on disconnect
      reconnectionDelay: 1000, // Wait 1 second before reconnecting
      reconnectionAttempts: 5, // Try up to 5 times before giving up
      timeout: 10000, // Connection timeout (increased to 10 seconds)
      autoConnect: true,
    });

    /**
     * Handle successful connection
     * @event connect
     */
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully to:', WS_URL);
      this.emit('connected'); // Notify listeners
    });

    /**
     * Handle disconnection
     * @event disconnect
     */
    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected'); // Notify listeners
    });

    /**
     * Handle connection errors
     * @event connect_error
     */
    this.socket.on('connect_error', (error) => {
      const socketError = error as {
        message?: string;
        type?: string;
        description?: string;
      };
      // Always log connection errors for debugging
      console.warn('WebSocket connection error:', {
        message: socketError.message,
        type: socketError.type,
        description: socketError.description,
        wsUrl: WS_URL,
      });
      this.emit('error', error); // Notify listeners
    });

    // Forward all events from server to registered listeners
    // This allows components to subscribe to any server event
    this.socket.onAny((event, ...args) => {
      this.emit(event, ...args);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRepository(repositoryId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join:repository', repositoryId);
    }
  }

  leaveRepository(repositoryId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave:repository', repositoryId);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
