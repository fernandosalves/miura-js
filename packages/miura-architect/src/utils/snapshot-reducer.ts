import type {
  AppSnapshot,
  ComponentInfo,
  ContextInfo,
  DevToolsMessage,
  SignalInfo,
  StoreInfo,
} from '../types.js';

export const EMPTY_SNAPSHOT: AppSnapshot = {
  components: [],
  signals: [],
  stores: [],
  contexts: [],
  timestamp: Date.now(),
};

export function normalizeSnapshot(input: Partial<AppSnapshot>): AppSnapshot {
  return {
    components: Array.isArray(input.components) ? input.components.map((component) => normalizeComponent(component)) : [],
    signals: Array.isArray(input.signals) ? input.signals.map((signal) => normalizeSignal(signal)) : [],
    stores: Array.isArray(input.stores) ? input.stores.map((store) => normalizeStore(store)) : [],
    contexts: Array.isArray(input.contexts) ? input.contexts.map((ctx) => normalizeContext(ctx)) : [],
    timestamp: Number(input.timestamp ?? Date.now()),
  };
}

export function applyDevtoolsMessage(snapshot: AppSnapshot, message: DevToolsMessage): AppSnapshot {
  const next = cloneSnapshot(snapshot);
  switch (message.type) {
    case 'APP_STATE_SNAPSHOT':
      return normalizeSnapshot(message.payload as Partial<AppSnapshot>);
    case 'component:discovered':
    case 'component:updated':
      return applyComponentUpsert(next, message.payload as Record<string, unknown>, message.timestamp);
    case 'component:removed':
      return applyComponentRemove(next, message.payload as Record<string, unknown>, message.timestamp);
    case 'signal:written':
    case 'signal:read':
      return applySignalEvent(next, message.type, message.payload as Record<string, unknown>, message.timestamp);
    case 'store:dispatched':
      return applyStoreEvent(next, message.payload as Record<string, unknown>, message.timestamp);
    case 'consume:resolved':
      return applyContextEvent(next, message.payload as Record<string, unknown>, message.timestamp);
    case 'FULL_SYNC':
      return applyFullSync(next, message.payload as Record<string, unknown>, message.timestamp);
    default:
      return snapshot;
  }
}

export function buildReplaySnapshot(initial: AppSnapshot, events: DevToolsMessage[], index: number): AppSnapshot {
  const end = Math.max(0, Math.min(index, events.length));
  let snapshot = normalizeSnapshot(initial);
  for (let i = 0; i < end; i += 1) {
    snapshot = applyDevtoolsMessage(snapshot, events[i]);
  }
  return snapshot;
}

function applyComponentUpsert(snapshot: AppSnapshot, payload: Record<string, unknown>, timestamp?: number): AppSnapshot {
  const id = String(payload.id ?? '');
  if (!id) return snapshot;
  const next: ComponentInfo = {
    id,
    tag: String(payload.tag ?? 'unknown'),
    parentId: payload.parentId ? String(payload.parentId) : null,
    updateCount: Number(payload.updateCount ?? 0),
    renderTime: Number(payload.renderTime ?? 0),
    connected: payload.isConnected !== undefined ? Boolean(payload.isConnected) : undefined,
    properties: asRecord(payload.properties),
    state: asRecord(payload.state),
  };

  const index = snapshot.components.findIndex((component) => component.id === id);
  if (index === -1) snapshot.components.push(next);
  else snapshot.components[index] = { ...snapshot.components[index], ...next };
  snapshot.timestamp = Number(timestamp ?? Date.now());
  return snapshot;
}

function applyComponentRemove(snapshot: AppSnapshot, payload: Record<string, unknown>, timestamp?: number): AppSnapshot {
  const id = String(payload.id ?? '');
  if (!id) return snapshot;
  snapshot.components = snapshot.components.filter((component) => component.id !== id);
  snapshot.timestamp = Number(timestamp ?? Date.now());
  return snapshot;
}

function applySignalEvent(
  snapshot: AppSnapshot,
  type: string,
  payload: Record<string, unknown>,
  timestamp?: number,
): AppSnapshot {
  const id = String(payload.id ?? '');
  if (!id) return snapshot;
  const index = snapshot.signals.findIndex((signal) => signal.id === id);
  const current = index === -1 ? ({ id, subscribers: [], dependencies: [] } as SignalInfo) : snapshot.signals[index];
  const next: SignalInfo = { ...current };
  next.label = payload.label ? String(payload.label) : current.label;
  next.type = (payload.type as SignalInfo['type']) ?? next.type ?? 'writable';

  if (type === 'signal:written') {
    next.value = Object.prototype.hasOwnProperty.call(payload, 'newValue') ? payload.newValue : payload.value;
    next.writeCount = (next.writeCount ?? 0) + 1;
    next.lastWriteTime = Number(timestamp ?? Date.now());
    next.valueHistory = [next.value, ...(next.valueHistory ?? [])].slice(0, 5);
    const writerId = payload.writerId ? String(payload.writerId) : '';
    if (writerId) {
      const writers = new Set(next.writers ?? []);
      writers.add(writerId);
      next.writers = [...writers];
    }
  } else {
    next.readCount = (next.readCount ?? 0) + 1;
    next.lastReadTime = Number(timestamp ?? Date.now());
    const readerId = payload.readerId ? String(payload.readerId) : '';
    if (readerId) {
      const subscribers = new Set(next.subscribers ?? []);
      subscribers.add(readerId);
      next.subscribers = [...subscribers];
    }
  }

  if (index === -1) snapshot.signals.push(next);
  else snapshot.signals[index] = next;
  snapshot.timestamp = Number(timestamp ?? Date.now());
  return snapshot;
}

function applyStoreEvent(snapshot: AppSnapshot, payload: Record<string, unknown>, timestamp?: number): AppSnapshot {
  const key = String(payload.storeKey ?? '');
  if (!key) return snapshot;
  const index = snapshot.stores.findIndex((store) => store.key === key);
  const current = index === -1 ? ({ key, state: {} } as StoreInfo) : snapshot.stores[index];
  const historyEntry = {
    action: String(payload.action ?? 'unknown'),
    args: Array.isArray(payload.args) ? payload.args : [],
    timestamp: Number(payload.timestamp ?? timestamp ?? Date.now()),
    duration: Number(payload.duration ?? 0),
    beforeState: asRecord(payload.beforeState),
    afterState: asRecord(payload.afterState),
  };
  const next: StoreInfo = {
    ...current,
    state: Object.keys(asRecord(payload.afterState)).length ? asRecord(payload.afterState) : current.state,
    dispatchHistory: [historyEntry, ...(current.dispatchHistory ?? [])].slice(0, 20),
  };
  if (index === -1) snapshot.stores.push(next);
  else snapshot.stores[index] = next;
  snapshot.timestamp = Number(timestamp ?? Date.now());
  return snapshot;
}

function applyContextEvent(snapshot: AppSnapshot, payload: Record<string, unknown>, timestamp?: number): AppSnapshot {
  const key = String(payload.contextKey ?? '');
  if (!key) return snapshot;
  const index = snapshot.contexts.findIndex((ctx) => ctx.key === key);
  const current = index === -1 ? ({ key, consumerIds: [] } as ContextInfo) : snapshot.contexts[index];
  const consumerId = payload.consumerComponentId ? String(payload.consumerComponentId) : '';
  const consumers = new Set(current.consumerIds ?? []);
  if (consumerId) consumers.add(consumerId);
  const next: ContextInfo = {
    ...current,
    providerId: payload.providerId ? String(payload.providerId) : current.providerId,
    value: Object.prototype.hasOwnProperty.call(payload, 'value') ? payload.value : current.value,
    consumerIds: [...consumers],
  };
  if (index === -1) snapshot.contexts.push(next);
  else snapshot.contexts[index] = next;
  snapshot.timestamp = Number(timestamp ?? Date.now());
  return snapshot;
}

function applyFullSync(snapshot: AppSnapshot, payload: Record<string, unknown>, timestamp?: number): AppSnapshot {
  // 1. Merge Components (Graph)
  // Components are typically the "current" view, but we merge to avoid flickering
  const newComponents = Array.isArray(payload.components) ? payload.components : (Array.isArray(payload.graph) ? payload.graph : []);
  if (newComponents.length > 0) {
    const componentMap = new Map(snapshot.components.map(c => [c.id, c]));
    newComponents.forEach(v => {
      const normalized = normalizeComponent(v);
      componentMap.set(normalized.id, normalized);
    });
    snapshot.components = [...componentMap.values()];
  }

  // 2. Merge Signals (Additive)
  // We never want signals to disappear just because they aren't currently "hot"
  if (Array.isArray(payload.signals)) {
    const signalMap = new Map(snapshot.signals.map(s => [s.id, s]));
    payload.signals.forEach(v => {
      const normalized = normalizeSignal(v);
      const existing = signalMap.get(normalized.id);
      if (existing) {
        signalMap.set(normalized.id, {
          ...existing,
          ...normalized,
          // Keep the merged writers/subscribers and history
          writers: [...new Set([...(existing.writers || []), ...(normalized.writers || [])])],
          subscribers: [...new Set([...(existing.subscribers || []), ...(normalized.subscribers || [])])],
          valueHistory: [...(normalized.valueHistory || []), ...(existing.valueHistory || [])].slice(0, 10)
        });
      } else {
        signalMap.set(normalized.id, normalized);
      }
    });
    snapshot.signals = [...signalMap.values()];
  }
  
  // 3. Merge Stores
  if (Array.isArray(payload.stores)) {
    const storeMap = new Map(snapshot.stores.map(s => [s.key, s]));
    payload.stores.forEach(v => {
      const normalized = normalizeStore(v);
      const existing = storeMap.get(normalized.key);
      if (existing) {
        storeMap.set(normalized.key, {
          ...existing,
          ...normalized,
          dispatchHistory: [...(normalized.dispatchHistory || []), ...(existing.dispatchHistory || [])].slice(0, 50)
        });
      } else {
        storeMap.set(normalized.key, normalized);
      }
    });
    snapshot.stores = [...storeMap.values()];
  }

  // 4. Merge Contexts
  if (Array.isArray(payload.contexts)) {
    const contextMap = new Map(snapshot.contexts.map(c => [c.key, c]));
    payload.contexts.forEach(v => {
      const normalized = normalizeContext(v);
      const existing = contextMap.get(normalized.key);
      if (existing) {
        contextMap.set(normalized.key, {
          ...existing,
          ...normalized,
          consumerIds: [...new Set([...(existing.consumerIds || []), ...(normalized.consumerIds || [])])]
        });
      } else {
        contextMap.set(normalized.key, normalized);
      }
    });
    snapshot.contexts = [...contextMap.values()];
  }

  snapshot.timestamp = Number(timestamp ?? Date.now());
  return snapshot;
}

function cloneSnapshot(snapshot: AppSnapshot): AppSnapshot {
  const safe = normalizeSnapshot(snapshot);
  return {
    components: [...safe.components],
    signals: [...safe.signals],
    stores: [...safe.stores],
    contexts: [...safe.contexts],
    timestamp: safe.timestamp,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function normalizeComponent(component: unknown): ComponentInfo {
  const record = asRecord(component);
  return {
    id: String(record.id ?? ''),
    tag: String(record.tag ?? 'unknown'),
    parentId: record.parentId ? String(record.parentId) : null,
    renderTime: Number(record.renderTime ?? 0),
    updateCount: Number(record.updateCount ?? 0),
    properties: asRecord(record.properties),
    state: asRecord(record.state),
    connected: record.connected !== undefined ? Boolean(record.connected) : undefined,
  };
}

function normalizeSignal(signal: unknown): SignalInfo {
  const record = asRecord(signal);
  return {
    id: String(record.id ?? ''),
    label: record.label ? String(record.label) : undefined,
    type: (record.type as SignalInfo['type']) ?? 'writable',
    value: record.value,
    subscribers: Array.isArray(record.subscribers) ? record.subscribers.map((v) => String(v)) : [],
    dependencies: Array.isArray(record.dependencies) ? record.dependencies.map((v) => String(v)) : [],
    writers: Array.isArray(record.writers) ? record.writers.map((v) => String(v)) : [],
    writeCount: Number(record.writeCount ?? 0),
    readCount: Number(record.readCount ?? 0),
    lastWriteTime: Number(record.lastWriteTime ?? 0) || undefined,
    lastReadTime: Number(record.lastReadTime ?? 0) || undefined,
    valueHistory: Array.isArray(record.valueHistory) ? [...record.valueHistory].slice(0, 5) : [],
  };
}

function normalizeStore(store: unknown): StoreInfo {
  const record = asRecord(store);
  return {
    key: String(record.key ?? ''),
    state: asRecord(record.state),
    subscribers: Array.isArray(record.subscribers) ? record.subscribers.map((v) => String(v)) : [],
    dispatchHistory: Array.isArray(record.dispatchHistory)
      ? record.dispatchHistory.map((entry) => {
          const row = asRecord(entry);
          return {
            action: String(row.action ?? 'unknown'),
            args: Array.isArray(row.args) ? row.args : [],
            timestamp: Number(row.timestamp ?? Date.now()),
            duration: Number(row.duration ?? 0),
            beforeState: asRecord(row.beforeState),
            afterState: asRecord(row.afterState),
          };
        })
      : [],
  };
}

function normalizeContext(context: unknown): ContextInfo {
  const record = asRecord(context);
  return {
    key: String(record.key ?? ''),
    value: record.value,
    providerId: record.providerId ? String(record.providerId) : undefined,
    consumerIds: Array.isArray(record.consumerIds) ? record.consumerIds.map((v) => String(v)) : [],
  };
}
