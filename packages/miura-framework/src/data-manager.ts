import {
    registerProvider,
    createProvider,
    Store,
    ProviderFactory,
    DataProvider,
    StoreState,
    StoreActions,
} from '@miura/miura-data-flow';
import type { DataStore, DataStream, DataStoreConfig } from './types.js';

interface StoreEntry {
    value: any;
    expiresAt?: number;
}

export class DataManager implements DataStore {
    private stores = new Map<string, Store<any>>();
    private lake = new Map<string, StoreEntry>();
    private subscribers = new Map<string, Set<(value: any) => void>>();
    private defaultTTL?: number;

    constructor(config?: Partial<DataStoreConfig>) {
        this.defaultTTL = config?.ttl;
    }

    /**
     * Registers a new data provider factory, making it available to the application.
     * @param name The unique name for the provider.
     * @param factory The provider factory instance.
     */
    registerProvider(name: string, factory: ProviderFactory) {
        registerProvider(name, factory);
    }

    /**
     * Creates an instance of a registered data provider.
     * @param name The name of the provider to create.
     * @param options The options to pass to the provider's constructor.
     */
    createProvider<T>(name: string, options: any): DataProvider<T> | undefined {
        return createProvider<T>(name, options);
    }

    /**
     * Creates and registers a new state store.
     * @param name The unique name for the store.
     * @param initialState The initial state of the store.
     * @param actions Optional actions to define for the store.
     */
    createStore<T extends StoreState>(
        name: string,
        initialState: T,
        actions?: StoreActions<T>,
    ): Store<T> {
        if (this.stores.has(name)) {
            throw new Error(`Store with name "${name}" already exists.`);
        }
        const store = new Store(initialState);
        if (actions) {
            store.defineActions(actions);
        }
        this.stores.set(name, store);
        return store;
    }

    /**
     * Retrieves a previously created store.
     * @param name The name of the store to retrieve.
     */
    getStore<T extends StoreState>(name: string): Store<T> | undefined {
        return this.stores.get(name);
    }

    /**
     * Returns statistics about the managed stores.
     */
    getStats() {
        return {
            storeCount: this.stores.size,
            lakeSize: this.lake.size,
        };
    }

    /**
     * Clears all registered stores.
     */
    clear() {
        this.stores.clear();
        this.lake.clear();
        this.subscribers.clear();
    }

    loadInitialData(entries: Record<string, any>): void {
        Object.entries(entries).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    set(key: string, value: any, ttl?: number): void {
        const expiresAt = this.resolveExpiry(ttl);
        this.lake.set(key, { value, expiresAt });
        this.notifySubscribers(key, value);
    }

    get(key: string): any {
        const entry = this.lake.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt && entry.expiresAt <= Date.now()) {
            this.lake.delete(key);
            return undefined;
        }
        return entry.value;
    }

    delete(key: string): void {
        if (this.lake.delete(key)) {
            this.notifySubscribers(key, undefined);
        }
    }

    subscribe(key: string, callback: (value: any) => void): () => void {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        const subscribers = this.subscribers.get(key)!;
        subscribers.add(callback);
        callback(this.get(key));
        return () => {
            subscribers.delete(callback);
            if (subscribers.size === 0) {
                this.subscribers.delete(key);
            }
        };
    }

    async *stream(key: string): AsyncIterable<DataStream> {
        const queue: DataStream[] = [];
        const waiters: Array<(value: void) => void> = [];

        const push = (value: any) => {
            const event: DataStream = {
                id: `${key}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
                data: value,
                timestamp: Date.now(),
                source: 'data-store',
            };
            queue.push(event);
            const waiter = waiters.shift();
            waiter?.();
        };

        const unsubscribe = this.subscribe(key, push);

        try {
            while (true) {
                if (queue.length === 0) {
                    await new Promise<void>((resolve) => waiters.push(resolve));
                }
                const next = queue.shift();
                if (next) {
                    yield next;
                }
            }
        } finally {
            unsubscribe();
        }
    }

    clearStore(): void {
        this.lake.clear();
        this.subscribers.clear();
    }

    private resolveExpiry(ttl?: number): number | undefined {
        const duration = ttl ?? this.defaultTTL;
        return duration ? Date.now() + duration : undefined;
    }

    private notifySubscribers(key: string, value: any): void {
        const subscribers = this.subscribers.get(key);
        if (!subscribers) return;
        subscribers.forEach((callback) => {
            try {
                callback(value);
            } catch (error) {
                console.error('DataStore subscriber error:', error);
            }
        });
    }
} 