import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    const { jwt } = useAuthStore.getState();
    cb({ token: jwt });
  },
});

export const socketService = {
  connect() {
    if (!socket.connected) {
      socket.connect();
    }
  },
  disconnect() {
    socket.disconnect();
  },

  // Handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPriceUpdate(callback: (data: any) => void) {
    socket.on('price:update', callback);
    return () => socket.off('price:update', callback);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChatMessage(callback: (data: any) => void) {
    socket.on('chat:message', callback);
    return () => socket.off('chat:message', callback);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRoundStarted(callback: (data: any) => void) {
    socket.on('round:started', callback);
    return () => socket.off('round:started', callback);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRoundResolved(callback: (data: any) => void) {
    socket.on('round:resolved', callback);
    return () => socket.off('round:resolved', callback);
  },

  // Emits
  joinRound(roundId: string) {
    socket.emit('join:round', roundId);
  },
  joinChat(channelId: string) {
    socket.emit('join:chat', channelId);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendChat(payload: any) {
    socket.emit('chat:send', payload);
  },
  joinNotifications(userId: string) {
    socket.emit('join:notifications', userId);
  },
};

// Lightweight channel-style wrapper used by the notifications UI.
// In tests, this is fully mocked; at runtime we simply ensure the socket
// is connected and attach/detach listeners for the given event.
export const appSocket = {
  joinChannel(channel: string) {
    // For now we just ensure the socket connection is active.
    // Channel-specific logic can be added on the backend if needed.
    socketService.connect();
    // Optionally, emit a join event if needed in future:
    // socket.emit(channel);
  },
  leaveChannel(_channel: string) {
    // No-op for now; connection lifecycle is handled elsewhere.
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(_channel: string, event: string, cb: (payload: any) => void) {
    const handler = (payload: any) => cb(payload);
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  },
};

