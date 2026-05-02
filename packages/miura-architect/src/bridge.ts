import { sanitizeForTransport } from './utils/serialization.js';

type GenericEvent = { type?: string; payload?: unknown; [k: string]: unknown };

class MiuraArchitectBridge {
  private socket: WebSocket | null = null;
  private connected = false;
  private queue: unknown[] = [];
  private unsubscribers: Array<() => void> = [];
  private fullSyncTimer = 0;
  private readonly serverUrl: string;

  constructor(serverUrl = 'ws://localhost:3006?target=true') {
    this.serverUrl = serverUrl;
    if (document.readyState === 'complete') {
      this.init();
    } else {
      window.addEventListener('load', () => this.init(), { once: true });
    }
  }

  private init(): void {
    this.connect();
    this.installDebuggerHooks();
  }

  private connect(): void {
    this.socket = new WebSocket(this.serverUrl);

    this.socket.onopen = () => {
      this.connected = true;
      this.sendInitialSnapshot();
      this.flush();
    };

    this.socket.onmessage = (event) => {
      const message = parseIncoming(event.data);
      if (!message) return;
      if (message.type === 'REQUEST_SNAPSHOT') {
        this.sendInitialSnapshot();
      }
    };

    this.socket.onclose = () => {
      this.connected = false;
      window.setTimeout(() => this.connect(), 5000);
    };
  }

  private installDebuggerHooks(): void {
    const win = window as Window & {
      miuraDebugger?: {
        subscribeEvents?: (listener: Record<string, (event: unknown) => void>) => () => void;
        subscribeComponentEvents?: (cb: (event: unknown) => void) => () => void;
        subscribeSignalEvents?: (cb: (event: unknown) => void) => () => void;
        subscribeStoreEvents?: (cb: (event: unknown) => void) => () => void;
        subscribeBindingEvents?: (cb: (event: unknown) => void) => () => void;
        subscribeTimeline?: (cb: (event: unknown[]) => void) => () => void;
        getComponentGraph?: () => unknown[];
        getAllSignals?: () => unknown[];
        getStores?: () => unknown[];
        getContexts?: () => unknown[];
        serializeUnknown?: (value: unknown) => unknown;
      };
    };

    if (!win.miuraDebugger) {
      console.warn('[miura-architect] miuraDebugger not available');
      return;
    }

    const onEvent = (event: unknown) => this.forwardDebuggerEvent(event);
    if (typeof win.miuraDebugger.subscribeEvents === 'function') {
      const unsubscribe = win.miuraDebugger.subscribeEvents({
        onComponentDiscovered: onEvent,
        onComponentUpdated: onEvent,
        onSignalWritten: onEvent,
        onSignalRead: onEvent,
        onStoreDispatched: onEvent,
        onConsumeResolved: onEvent,
        onBindingCreated: onEvent,
      });
      this.unsubscribers.push(unsubscribe);
    } else {
      this.subscribeFallback(win);
    }

    this.fullSyncTimer = window.setInterval(() => {
      this.send({
        type: 'FULL_SYNC',
        payload: {
          graph: win.miuraDebugger?.getComponentGraph?.() ?? [],
          signals: win.miuraDebugger?.getAllSignals?.() ?? [],
          stores: win.miuraDebugger?.getStores?.() ?? [],
          contexts: win.miuraDebugger?.getContexts?.() ?? [],
          reason: 'background-sync',
        },
      });
    }, 5000);
  }

  private subscribeFallback(win: Window & { miuraDebugger?: Record<string, unknown> }): void {
    const dbg = win.miuraDebugger as {
      subscribeComponentEvents?: (cb: (event: unknown) => void) => () => void;
      subscribeSignalEvents?: (cb: (event: unknown) => void) => () => void;
      subscribeStoreEvents?: (cb: (event: unknown) => void) => () => void;
      subscribeBindingEvents?: (cb: (event: unknown) => void) => () => void;
      subscribeContextEvents?: (cb: (event: unknown) => void) => () => void;
      subscribeTimeline?: (cb: (events: unknown[]) => void) => () => void;
    };

    if (typeof dbg.subscribeComponentEvents === 'function') {
      this.unsubscribers.push(dbg.subscribeComponentEvents((event) => this.forwardDebuggerEvent(event)));
    }
    if (typeof dbg.subscribeSignalEvents === 'function') {
      this.unsubscribers.push(dbg.subscribeSignalEvents((event) => this.forwardDebuggerEvent(event)));
    }
    if (typeof dbg.subscribeStoreEvents === 'function') {
      this.unsubscribers.push(dbg.subscribeStoreEvents((event) => this.forwardDebuggerEvent(event)));
    }
    if (typeof dbg.subscribeBindingEvents === 'function') {
      this.unsubscribers.push(dbg.subscribeBindingEvents((event) => this.forwardDebuggerEvent(event)));
    }
    if (typeof dbg.subscribeContextEvents === 'function') {
      this.unsubscribers.push(dbg.subscribeContextEvents((event) => this.forwardDebuggerEvent(event)));
    }
    if (typeof dbg.subscribeTimeline === 'function') {
      this.unsubscribers.push(
        dbg.subscribeTimeline((events) => {
          for (const event of events) this.forwardDebuggerEvent(event);
        }),
      );
    }
  }

  private sendInitialSnapshot(): void {
    const win = window as Window & {
      miuraDebugger?: {
        getComponentGraph?: () => unknown[];
        getAllSignals?: () => unknown[];
        getStores?: () => unknown[];
        getContexts?: () => unknown[];
      };
    };

    this.send({
      type: 'APP_STATE_SNAPSHOT',
      payload: {
        components: win.miuraDebugger?.getComponentGraph?.() ?? [],
        signals: win.miuraDebugger?.getAllSignals?.() ?? [],
        stores: win.miuraDebugger?.getStores?.() ?? [],
        contexts: win.miuraDebugger?.getContexts?.() ?? [],
        timestamp: Date.now(),
      },
    });
  }

  private forwardDebuggerEvent(event: unknown): void {
    const raw = (event ?? {}) as GenericEvent;
    const eventType = raw.type ? String(raw.type) : 'timeline:event';
    this.send({
      type: eventType,
      payload: sanitizeForTransport(raw.payload ?? raw),
    });
  }

  private send(message: { type: string; payload: unknown }): void {
    const safeMessage = sanitizeForTransport(message) as Record<string, unknown>;
    const payload = JSON.stringify({
      ...safeMessage,
      timestamp: Date.now(),
    });

    if (this.connected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
      return;
    }
    this.queue.push(payload);
  }

  private flush(): void {
    while (this.connected && this.socket && this.socket.readyState === WebSocket.OPEN && this.queue.length) {
      const encoded = this.queue.shift();
      this.socket.send(String(encoded));
    }
  }

  destroy(): void {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.unsubscribers = [];
    if (this.fullSyncTimer) window.clearInterval(this.fullSyncTimer);
    this.socket?.close();
  }
}

function parseIncoming(raw: unknown): { type: string; payload: unknown } | null {
  try {
    const parsed = JSON.parse(String(raw)) as { type?: unknown; payload?: unknown };
    return { type: String(parsed.type ?? ''), payload: parsed.payload };
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    __MIURA_ARCHITECT_BRIDGE__?: MiuraArchitectBridge;
  }
}

if (!window.__MIURA_ARCHITECT_BRIDGE__) {
  window.__MIURA_ARCHITECT_BRIDGE__ = new MiuraArchitectBridge();
}
