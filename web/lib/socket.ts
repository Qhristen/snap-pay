import { io, Socket } from 'socket.io-client';

const SOCKET_URL = `${process.env.NEXT_PUBLIC_API_URL!}/socket`;

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
