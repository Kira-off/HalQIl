import { SocketEvent } from './socketEvents';

class SocketManager {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private isManuallyClosed = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private readonly reconnectInterval = 2000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly listeners = new Map<SocketEvent, Set<(data: unknown) => void>>();

  connect(token: string): void {
    this.isManuallyClosed = false;
    this.token = token;

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'localhost:8000/ws';
    const wsUrl = baseUrl.includes('://') ? `${baseUrl}?token=${token}` : `wss://${baseUrl}?token=${token}`;

    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        return;
      }
      this.socket.close();
    }

    try {
      this.socket = new WebSocket(wsUrl);
    } catch (err) {
      console.error('Failed to create WebSocket instance:', err);
      this.handleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        const eventName = rawData.event || rawData.type;
        const eventData = rawData.hasOwnProperty('data') ? rawData.data : rawData.payload;

        if (eventName) {
          const handlers = this.listeners.get(eventName as SocketEvent);
          if (handlers) {
            handlers.forEach((handler) => {
              try {
                handler(eventData);
              } catch (err) {
                console.error(`Error in socket event handler for ${eventName}:`, err);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocket connection closed (code: ${event.code})`);
      if (!this.isManuallyClosed) {
        this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error encountered:', error);
    };
  }

  disconnect(): void {
    this.isManuallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.token = null;
    this.reconnectAttempts = 0;
    this.listeners.clear();
  }

  on(event: SocketEvent, handler: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: SocketEvent): void {
    this.listeners.delete(event);
  }

  emit(event: SocketEvent, data: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn(`WebSocket is not connected. Cannot emit event: ${event}`);
      return;
    }
    try {
      this.socket.send(JSON.stringify({ event, data }));
    } catch (err) {
      console.error(`Failed to send message for event ${event}:`, err);
    }
  }

  simulateIncomingEvent(event: SocketEvent, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Error in simulated socket event handler for ${event}:`, err);
        }
      });
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket connection failed after 3 reconnection attempts. Stopping.');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    console.log(`Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in 2s...`);

    this.reconnectTimer = setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, this.reconnectInterval);
  }
}

export const socketManager = new SocketManager();
