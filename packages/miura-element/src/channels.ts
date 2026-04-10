export interface Beacon<T> {
    readonly key?: string;
    emit(value: T): void;
    on(listener: (value: T) => void): () => void;
    once(listener: (value: T) => void): () => void;
    off(listener: (value: T) => void): void;
    clear(): void;
}

export interface Pulse {
    readonly key?: string;
    emit(): void;
    on(listener: () => void): () => void;
    once(listener: () => void): () => void;
    off(listener: () => void): void;
    clear(): void;
}

type Listener<T> = {
    callback: (value: T) => void;
    once: boolean;
};

class BeaconChannel<T> implements Beacon<T> {
    readonly key?: string;
    private readonly listeners = new Set<Listener<T>>();

    constructor(key?: string) {
        this.key = key;
    }

    emit(value: T): void {
        const listeners = Array.from(this.listeners);
        for (const listener of listeners) {
            try {
                listener.callback(value);
            } finally {
                if (listener.once) {
                    this.listeners.delete(listener);
                }
            }
        }
    }

    on(listener: (value: T) => void): () => void {
        const wrapped: Listener<T> = { callback: listener, once: false };
        this.listeners.add(wrapped);
        return () => this.listeners.delete(wrapped);
    }

    once(listener: (value: T) => void): () => void {
        const wrapped: Listener<T> = { callback: listener, once: true };
        this.listeners.add(wrapped);
        return () => this.listeners.delete(wrapped);
    }

    off(listener: (value: T) => void): void {
        for (const entry of this.listeners) {
            if (entry.callback === listener) {
                this.listeners.delete(entry);
            }
        }
    }

    clear(): void {
        this.listeners.clear();
    }
}

const beaconRegistry = new Map<string, Beacon<unknown>>();
const pulseRegistry = new Map<string, Pulse>();

export function createBeacon<T>(): Beacon<T>;
export function createBeacon<T>(key: string): Beacon<T>;
export function createBeacon<T>(key?: string): Beacon<T> {
    if (key) {
        const existing = beaconRegistry.get(key) as Beacon<T> | undefined;
        if (existing) {
            return existing;
        }
        const created = new BeaconChannel<T>(key);
        beaconRegistry.set(key, created as Beacon<unknown>);
        return created;
    }

    return new BeaconChannel<T>();
}

export function useBeacon<T>(key: string): Beacon<T> {
    return createBeacon<T>(key);
}

export function hasBeacon(key: string): boolean {
    return beaconRegistry.has(key);
}

export function getBeacon<T>(key: string): Beacon<T> | undefined {
    return beaconRegistry.get(key) as Beacon<T> | undefined;
}

export function clearBeacons(): void {
    beaconRegistry.clear();
}

export function createPulse(): Pulse;
export function createPulse(key: string): Pulse;
export function createPulse(key?: string): Pulse {
    const channel = key
        ? createBeacon<void>(key)
        : createBeacon<void>();
    return {
        key: channel.key,
        emit: () => channel.emit(),
        on: (listener: () => void) => channel.on(listener),
        once: (listener: () => void) => channel.once(listener),
        off: (listener: () => void) => channel.off(listener),
        clear: () => channel.clear(),
    };
}

export function usePulse(key: string): Pulse {
    const existing = pulseRegistry.get(key);
    if (existing) {
        return existing;
    }

    const created = createPulse(key);
    pulseRegistry.set(key, created);
    return created;
}

export function hasPulse(key: string): boolean {
    return pulseRegistry.has(key);
}

export function getPulse(key: string): Pulse | undefined {
    return pulseRegistry.get(key);
}

export function clearPulses(): void {
    pulseRegistry.clear();
}
