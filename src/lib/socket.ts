const WS_BASE = import.meta.env.VITE_WS_URL ?? '';

// Simple WebSocket wrapper that emits/receives JSON messages.
export class AppSocket {
  private ws?: WebSocket;
  private url: string;
  private listeners = new Map<string, Set<(data: unknown) => void>>();

  constructor() {
    this.url = WS_BASE;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener('message', (e) => {
      try {
        const msg = JSON.parse(e.data);
        const { channel, event, payload } = msg as { channel?: string; event?: string; payload?: unknown };
        if (!channel || !event) return;
        const key = `${channel}:${event}`;
        const set = this.listeners.get(key);
        if (set) set.forEach(fn => fn(payload));
      } catch (err) {
        // ignore malformed
        // keep a console log for debugging in dev
        console.error('Malformed websocket message', err);
      }
    });
  }

  joinChannel(channel: string) {
    this.connect();
    // send join message; server must support this shape
    this.ws?.addEventListener('open', () => {
      this.ws?.send(JSON.stringify({ action: 'join', channel }));
    });
  }

  leaveChannel(channel: string) {
    try {
      this.ws?.send(JSON.stringify({ action: 'leave', channel }));
    } catch {
      // ignore
    }
  }

  on(channel: string, event: string, cb: (data: unknown) => void) {
    const key = `${channel}:${event}`;
    const set = this.listeners.get(key) ?? new Set();
    set.add(cb);
    this.listeners.set(key, set);
    return () => {
      set.delete(cb);
      if (set.size === 0) this.listeners.delete(key);
    };
  }

  disconnect() {
    if (!this.ws) return;
    try { this.ws.close(); } catch {
      // ignore
    }
    this.ws = undefined;
    this.listeners.clear();
  }
}

export const appSocket = new AppSocket();
