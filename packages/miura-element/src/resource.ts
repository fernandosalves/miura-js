import type { TemplateResult } from '@miurajs/miura-render';

export type ResourceState = 'idle' | 'pending' | 'resolved' | 'rejected';
export type ResourceKeyPart = string | number | boolean;
export type ResourceKey = string | readonly ResourceKeyPart[];

export interface ResourceViewOptions<T, R extends TemplateResult> {
    idle?: () => R;
    pending?: () => R;
    ok?: (value: T) => R;
    error?: (error: unknown) => R;
}

export interface Resource<T> {
    readonly state: ResourceState;
    readonly loading: boolean;
    readonly value?: T;
    readonly data?: T;
    readonly error?: unknown;
    readonly promise?: Promise<T> | null;
    readonly key?: string;
    refresh(): Promise<T>;
    invalidate(): void;
    view<R extends TemplateResult>(options: ResourceViewOptions<T, R>): R | undefined;
}

export interface ResourceOptions {
    auto?: boolean;
    key?: ResourceKey;
}

type CacheEntry<T> = {
    state: ResourceState;
    value?: T;
    error?: unknown;
    promise: Promise<T> | null;
    generation: number;
    listeners: Set<() => void>;
};

const resourceCache = new Map<string, CacheEntry<unknown>>();

export function resourceKey(...parts: readonly ResourceKeyPart[]): string {
    return parts.map((part) => String(part)).join(':');
}

function normalizeResourceKey(key: ResourceKey): string {
    return Array.isArray(key) ? resourceKey(...key) : key;
}

function createCacheEntry<T>(): CacheEntry<T> {
    return {
        state: 'idle',
        value: undefined,
        error: undefined,
        promise: null,
        generation: 0,
        listeners: new Set(),
    };
}

function getCacheEntry<T>(key: string): CacheEntry<T> {
    const existing = resourceCache.get(key) as CacheEntry<T> | undefined;
    if (existing) {
        return existing;
    }

    const created = createCacheEntry<T>();
    resourceCache.set(key, created as CacheEntry<unknown>);
    return created;
}

function notifyEntry(entry: CacheEntry<unknown>): void {
    entry.listeners.forEach((listener) => listener());
}

export function clearResourceCache(): void {
    resourceCache.clear();
}

export function invalidateResource(key: ResourceKey): void {
    resourceCache.delete(normalizeResourceKey(key));
}

export function hasResourceCache(key: ResourceKey): boolean {
    return resourceCache.has(normalizeResourceKey(key));
}

class ResourceController<T> implements Resource<T> {
    private _state: ResourceState = 'idle';
    private _value?: T;
    private _error?: unknown;
    private _promise: Promise<T> | null = null;
    private _generation = 0;
    private readonly normalizedKey?: string;
    private cacheEntry?: CacheEntry<T>;
    private cacheListener?: () => void;

    constructor(
        private readonly loader: () => Promise<T> | T,
        private readonly onChange: () => void,
        options: ResourceOptions = {}
    ) {
        if (options.key !== undefined) {
            this.normalizedKey = normalizeResourceKey(options.key);
            this.cacheEntry = getCacheEntry<T>(this.normalizedKey);
            this.cacheListener = () => {
                this.syncFromCache();
                this.onChange();
            };
            this.cacheEntry.listeners.add(this.cacheListener);
            this.syncFromCache();
        }

        if (options.auto !== false) {
            void this.refresh();
        }
    }

    get state(): ResourceState {
        return this._state;
    }

    get loading(): boolean {
        return this._state === 'pending';
    }

    get value(): T | undefined {
        return this._value;
    }

    get data(): T | undefined {
        return this._value;
    }

    get error(): unknown {
        return this._error;
    }

    get promise(): Promise<T> | null {
        return this._promise;
    }

    get key(): string | undefined {
        return this.normalizedKey;
    }

    async refresh(): Promise<T> {
        if (this.cacheEntry) {
            return this.refreshCacheEntry(this.cacheEntry);
        }

        return this.refreshLocal();
    }

    invalidate(): void {
        if (this.cacheEntry && this.normalizedKey) {
            this.cacheEntry.listeners.delete(this.cacheListener!);
            invalidateResource(this.normalizedKey);
            this._state = 'idle';
            this._value = undefined;
            this._error = undefined;
            this._promise = null;
            const freshEntry = getCacheEntry<T>(this.normalizedKey);
            freshEntry.listeners.add(this.cacheListener!);
            this.cacheEntry = freshEntry;
        } else {
            this._state = 'idle';
            this._value = undefined;
            this._error = undefined;
            this._promise = null;
            this._generation = 0;
        }
        this.onChange();
    }

    view<R extends TemplateResult>(options: ResourceViewOptions<T, R>): R | undefined {
        switch (this._state) {
            case 'idle':
                return options.idle?.();
            case 'pending':
                return options.pending?.();
            case 'resolved':
                return this._value !== undefined ? options.ok?.(this._value) : options.idle?.();
            case 'rejected':
                return options.error?.(this._error);
        }
    }

    private syncFromCache(): void {
        if (!this.cacheEntry) {
            return;
        }

        this._state = this.cacheEntry.state;
        this._value = this.cacheEntry.value;
        this._error = this.cacheEntry.error;
        this._promise = this.cacheEntry.promise;
    }

    private async refreshCacheEntry(entry: CacheEntry<T>): Promise<T> {
        if (entry.promise) {
            this.syncFromCache();
            return entry.promise;
        }

        const generation = ++entry.generation;
        entry.state = 'pending';
        entry.error = undefined;
        const promise = Promise.resolve(this.loader());
        entry.promise = promise;
        notifyEntry(entry);

        try {
            const value = await promise;
            if (generation !== entry.generation) {
                return value;
            }

            entry.value = value;
            entry.state = 'resolved';
            entry.promise = null;
            notifyEntry(entry);
            return value;
        } catch (error) {
            if (generation !== entry.generation) {
                throw error;
            }

            entry.error = error;
            entry.state = 'rejected';
            entry.promise = null;
            notifyEntry(entry);
            throw error;
        }
    }

    private async refreshLocal(): Promise<T> {
        const generation = ++this._generation;
        this._state = 'pending';
        this._error = undefined;

        const promise = Promise.resolve(this.loader());
        this._promise = promise;
        this.onChange();

        try {
            const value = await promise;
            if (generation !== this._generation) {
                return value;
            }

            this._value = value;
            this._state = 'resolved';
            this._promise = null;
            this.onChange();
            return value;
        } catch (error) {
            if (generation !== this._generation) {
                throw error;
            }

            this._error = error;
            this._state = 'rejected';
            this._promise = null;
            this.onChange();
            throw error;
        }
    }
}

export function createResource<T>(
    loader: () => Promise<T> | T,
    onChange: () => void,
    options?: ResourceOptions
): Resource<T> {
    return new ResourceController(loader, onChange, options);
}
