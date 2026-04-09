import { signal, type Signal } from './signals.js';

const sharedSignals = new Map<string, Signal<unknown>>();

export type SharedKeyPart = string | number;
export type SharedKey = string | readonly SharedKeyPart[];

export function sharedKey(...parts: readonly SharedKeyPart[]): string {
    return parts.map((part) => String(part)).join(':');
}

function normalizeSharedKey(key: SharedKey): string {
    return Array.isArray(key) ? sharedKey(...key) : String(key);
}

export function createSharedNamespace(namespace: string) {
    return {
        key: (...parts: readonly SharedKeyPart[]) => sharedKey(namespace, ...parts),
        has: (key: SharedKey) => hasShared([namespace, ...(Array.isArray(key) ? key : [key])]),
        get: <T>(key: SharedKey) => getShared<T>([namespace, ...(Array.isArray(key) ? key : [key])]),
        use: <T>(key: SharedKey, initial: T) => shared([namespace, ...(Array.isArray(key) ? key : [key])], initial),
    };
}

export function shared<T>(key: SharedKey, initial: T): Signal<T> {
    const normalizedKey = normalizeSharedKey(key);
    const existing = sharedSignals.get(normalizedKey) as Signal<T> | undefined;
    if (existing) {
        return existing;
    }

    const created = signal(initial);
    sharedSignals.set(normalizedKey, created as Signal<unknown>);
    return created;
}

export function hasShared(key: SharedKey): boolean {
    return sharedSignals.has(normalizeSharedKey(key));
}

export function getShared<T>(key: SharedKey): Signal<T> | undefined {
    return sharedSignals.get(normalizeSharedKey(key)) as Signal<T> | undefined;
}

export function clearShared(): void {
    sharedSignals.clear();
}
