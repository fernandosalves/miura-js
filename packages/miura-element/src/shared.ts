import { signal, type Signal } from './signals.js';

const sharedSignals = new Map<string, Signal<unknown>>();
export const GLOBAL_SIGNAL_KEY_PREFIX = '__global_sig_';
const TEMPLATE_READ_COLLECTOR = Symbol.for('miura:template-read-collector');

export type SharedKeyPart = string | number;
export type SharedKey = string | readonly SharedKeyPart[];

export function sharedKey(...parts: readonly SharedKeyPart[]): string {
    return parts.map((part) => String(part)).join(':');
}

function normalizeSharedKey(key: SharedKey): string {
    return Array.isArray(key) ? sharedKey(...key) : String(key);
}

export function resolveSharedKey(key: SharedKey): string {
    return normalizeSharedKey(key);
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

export function createGlobalProperties(
    instance: any,
    globals: Record<string, { key?: SharedKey; initial?: unknown }>,
): void {
    for (const [name, options] of Object.entries(globals)) {
        const normalizedKey = resolveSharedKey(options.key ?? name);
        const sigKey = `${GLOBAL_SIGNAL_KEY_PREFIX}${name}`;
        const sharedSignal = shared(normalizedKey, options.initial);

        Object.defineProperty(instance, sigKey, {
            value: sharedSignal,
            writable: false,
            enumerable: false,
            configurable: false,
        });

        Object.defineProperty(instance, name, {
            get() {
                const s = (this as any)[sigKey] as Signal<unknown>;
                const value = s.peek();
                const collector = (globalThis as any)[TEMPLATE_READ_COLLECTOR];
                if (typeof collector === 'function') {
                    collector(this, name, s, value);
                }
                return value;
            },
            set(value: unknown) {
                (this as any)[sigKey](value);
            },
            configurable: true,
            enumerable: true,
        });
    }
}
