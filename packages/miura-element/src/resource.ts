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
    readonly refreshing: boolean;
    readonly value?: T;
    readonly data?: T;
    readonly error?: unknown;
    readonly promise?: Promise<T> | null;
    readonly key?: string;
    refresh(options?: { force?: boolean }): Promise<T>;
    invalidate(): void;
    hydrate(value: T): void;
    rekey(key?: ResourceKey): void;
    view<R extends TemplateResult>(options: ResourceViewOptions<T, R>): R | undefined;
}

export interface ResourceOptions {
    auto?: boolean;
    key?: ResourceKey;
    staleWhileRevalidate?: boolean;
    staleTime?: number;
    cacheTime?: number;
}

type CacheEntry<T> = {
    state: ResourceState;
    refreshing: boolean;
    value?: T;
    error?: unknown;
    promise: Promise<T> | null;
    generation: number;
    listeners: Set<() => void>;
    updatedAt: number;
    staleTime?: number;
    cacheTime?: number;
    gcTimer: ReturnType<typeof setTimeout> | null;
};

const resourceCache = new Map<string, CacheEntry<unknown>>();

export function resourceKey(...parts: readonly ResourceKeyPart[]): string {
    return parts.map((part) => String(part)).join(':');
}

function normalizeResourceKey(key: ResourceKey): string {
    return Array.isArray(key) ? resourceKey(...key) : String(key);
}

function createCacheEntry<T>(): CacheEntry<T> {
    return {
        state: 'idle',
        refreshing: false,
        value: undefined,
        error: undefined,
        promise: null,
        generation: 0,
        listeners: new Set(),
        updatedAt: 0,
        staleTime: undefined,
        cacheTime: undefined,
        gcTimer: null,
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

function applyCachePolicy(entry: CacheEntry<unknown>, staleTime?: number, cacheTime?: number): void {
    entry.staleTime = staleTime;
    entry.cacheTime = cacheTime;
}

function clearGcTimer(entry: CacheEntry<unknown>): void {
    if (entry.gcTimer) {
        clearTimeout(entry.gcTimer);
        entry.gcTimer = null;
    }
}

function scheduleGc(key: string, entry: CacheEntry<unknown>): void {
    clearGcTimer(entry);
    if (!entry.cacheTime || entry.cacheTime <= 0 || entry.listeners.size > 0) {
        return;
    }

    entry.gcTimer = setTimeout(() => {
        if (entry.listeners.size === 0) {
            resourceCache.delete(key);
        }
    }, entry.cacheTime);
}

function isEntryFresh(entry: CacheEntry<unknown>): boolean {
    return !!entry.staleTime && entry.updatedAt > 0 && Date.now() - entry.updatedAt < entry.staleTime;
}

export function clearResourceCache(): void {
    resourceCache.clear();
}

export function invalidateResource(key: ResourceKey): void {
    const normalized = normalizeResourceKey(key);
    const entry = resourceCache.get(normalized);
    if (entry) {
        clearGcTimer(entry);
    }
    resourceCache.delete(normalized);
}

export function invalidateResourceNamespace(namespace: string): void {
    for (const [key, entry] of resourceCache.entries()) {
        if (key === namespace || key.startsWith(`${namespace}:`)) {
            clearGcTimer(entry);
            resourceCache.delete(key);
        }
    }
}

export function hasResourceCache(key: ResourceKey): boolean {
    return resourceCache.has(normalizeResourceKey(key));
}

class ResourceController<T> implements Resource<T> {
    private _state: ResourceState = 'idle';
    private _refreshing = false;
    private _value?: T;
    private _error?: unknown;
    private _promise: Promise<T> | null = null;
    private _generation = 0;
    private _updatedAt = 0;
    private normalizedKey?: string;
    private cacheEntry?: CacheEntry<T>;
    private cacheListener?: () => void;

    constructor(
        private readonly loader: () => Promise<T> | T,
        private readonly onChange: () => void,
        private readonly options: ResourceOptions = {}
    ) {
        if (this.options.key !== undefined) {
            this.normalizedKey = normalizeResourceKey(this.options.key);
            this.cacheEntry = getCacheEntry<T>(this.normalizedKey);
            applyCachePolicy(this.cacheEntry, this.options.staleTime, this.options.cacheTime);
            this.cacheListener = () => {
                this.syncFromCache();
                this.onChange();
            };
            clearGcTimer(this.cacheEntry);
            this.cacheEntry.listeners.add(this.cacheListener);
            this.syncFromCache();
        }

        if (this.options.auto !== false) {
            void this.refresh();
        }
    }

    get state(): ResourceState {
        return this._state;
    }

    get loading(): boolean {
        return this._state === 'pending';
    }

    get refreshing(): boolean {
        return this._refreshing;
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

    async refresh(options: { force?: boolean } = {}): Promise<T> {
        if (this.cacheEntry) {
            return this.refreshCacheEntry(this.cacheEntry, options.force === true);
        }

        return this.refreshLocal(options.force === true);
    }

    invalidate(): void {
        if (this.cacheEntry && this.normalizedKey) {
            this.cacheEntry.listeners.delete(this.cacheListener!);
            scheduleGc(this.normalizedKey, this.cacheEntry);
            invalidateResource(this.normalizedKey);
            this._state = 'idle';
            this._refreshing = false;
            this._value = undefined;
            this._error = undefined;
            this._promise = null;
            const freshEntry = getCacheEntry<T>(this.normalizedKey);
            applyCachePolicy(freshEntry, this.options.staleTime, this.options.cacheTime);
            freshEntry.listeners.add(this.cacheListener!);
            this.cacheEntry = freshEntry;
        } else {
            this._state = 'idle';
            this._refreshing = false;
            this._value = undefined;
            this._error = undefined;
            this._promise = null;
            this._generation = 0;
        }
        this.onChange();
    }

    hydrate(value: T): void {
        if (this.cacheEntry) {
            this.cacheEntry.value = value;
            this.cacheEntry.state = 'resolved';
            this.cacheEntry.refreshing = false;
            this.cacheEntry.error = undefined;
            this.cacheEntry.promise = null;
            this.cacheEntry.updatedAt = Date.now();
            notifyEntry(this.cacheEntry);
            return;
        }

        this._value = value;
        this._state = 'resolved';
        this._refreshing = false;
        this._error = undefined;
        this._promise = null;
        this._updatedAt = Date.now();
        this.onChange();
    }

    rekey(key?: ResourceKey): void {
        if (this.cacheEntry && this.cacheListener) {
            this.cacheEntry.listeners.delete(this.cacheListener);
            if (this.normalizedKey) {
                scheduleGc(this.normalizedKey, this.cacheEntry);
            }
        }

        this.normalizedKey = key !== undefined ? normalizeResourceKey(key) : undefined;
        this.cacheEntry = undefined;
        this.cacheListener = undefined;

        if (this.normalizedKey !== undefined) {
            this.cacheEntry = getCacheEntry<T>(this.normalizedKey);
            applyCachePolicy(this.cacheEntry, this.options.staleTime, this.options.cacheTime);
            this.cacheListener = () => {
                this.syncFromCache();
                this.onChange();
            };
            clearGcTimer(this.cacheEntry);
            this.cacheEntry.listeners.add(this.cacheListener);
            this.syncFromCache();
        }

        if (!this.cacheEntry) {
            this._state = 'idle';
            this._refreshing = false;
            this._value = undefined;
            this._error = undefined;
            this._promise = null;
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
        this._refreshing = this.cacheEntry.refreshing;
        this._value = this.cacheEntry.value;
        this._error = this.cacheEntry.error;
        this._promise = this.cacheEntry.promise;
        this._updatedAt = this.cacheEntry.updatedAt;
    }

    private async refreshCacheEntry(entry: CacheEntry<T>, force = false): Promise<T> {
        if (entry.promise) {
            this.syncFromCache();
            return entry.promise;
        }

        if (!force && entry.state === 'resolved' && entry.value !== undefined && isEntryFresh(entry)) {
            this.syncFromCache();
            return entry.value;
        }

        const generation = ++entry.generation;
        entry.refreshing = this.shouldKeepValueWhileRefreshing();
        entry.state = entry.refreshing ? 'resolved' : 'pending';
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
            entry.refreshing = false;
            entry.promise = null;
            entry.updatedAt = Date.now();
            notifyEntry(entry);
            return value;
        } catch (error) {
            if (generation !== entry.generation) {
                throw error;
            }

            entry.error = error;
            entry.state = entry.value !== undefined && this.shouldKeepValueWhileRefreshing() ? 'resolved' : 'rejected';
            entry.refreshing = false;
            entry.promise = null;
            notifyEntry(entry);
            throw error;
        }
    }

    private async refreshLocal(force = false): Promise<T> {
        if (!force && this._state === 'resolved' && this._value !== undefined && this.options.staleTime && this._updatedAt > 0) {
            if (Date.now() - this._updatedAt < this.options.staleTime) {
                return this._value;
            }
        }

        const generation = ++this._generation;
        this._refreshing = this.shouldKeepValueWhileRefreshing();
        this._state = this._refreshing ? 'resolved' : 'pending';
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
            this._refreshing = false;
            this._promise = null;
            this._updatedAt = Date.now();
            this.onChange();
            return value;
        } catch (error) {
            if (generation !== this._generation) {
                throw error;
            }

            this._error = error;
            this._state = this._value !== undefined && this.shouldKeepValueWhileRefreshing() ? 'resolved' : 'rejected';
            this._refreshing = false;
            this._promise = null;
            this.onChange();
            throw error;
        }
    }

    private shouldKeepValueWhileRefreshing(): boolean {
        return this._value !== undefined && this.options.staleWhileRevalidate === true;
    }
}

export function createResource<T>(
    loader: () => Promise<T> | T,
    onChange: () => void,
    options?: ResourceOptions
): Resource<T> {
    return new ResourceController(loader, onChange, options);
}
