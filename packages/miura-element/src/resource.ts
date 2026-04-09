import type { TemplateResult } from '@miurajs/miura-render';

export type ResourceState = 'idle' | 'pending' | 'resolved' | 'rejected';

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
    refresh(): Promise<T>;
    view<R extends TemplateResult>(options: ResourceViewOptions<T, R>): R | undefined;
}

export interface ResourceOptions {
    auto?: boolean;
}

class ResourceController<T> implements Resource<T> {
    private _state: ResourceState = 'idle';
    private _value?: T;
    private _error?: unknown;
    private _promise: Promise<T> | null = null;
    private _generation = 0;

    constructor(
        private readonly loader: () => Promise<T> | T,
        private readonly onChange: () => void,
        options: ResourceOptions = {}
    ) {
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

    async refresh(): Promise<T> {
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
}

export function createResource<T>(
    loader: () => Promise<T> | T,
    onChange: () => void,
    options?: ResourceOptions
): Resource<T> {
    return new ResourceController(loader, onChange, options);
}
