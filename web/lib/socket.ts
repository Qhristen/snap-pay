import { io, Socket } from 'socket.io-client';

const SOCKET_URL = `${process.env.NEXT_PUBLIC_API_URL!}/wallet`;

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;

  connect(token: string) {
    if (this.socket?.connected && this.currentToken === token) return;

    if (this.socket) {
      console.log('🔌 Disconnecting existing socket before re-connecting with new token...');
      this.socket.disconnect();
    }

    this.currentToken = token;
    console.log('🔌 Initializing socket connection to:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity, // Keep trying to reconnect
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server:', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Disconnected from socket server:', reason);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log('🔄 Reconnection attempt:', attempt);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Manually disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
