import { computed, type ReadonlySignal, type Signal } from './signals.js';

type SignalLike<T> = Pick<Signal<T>, 'peek' | 'subscribe'> & Partial<Pick<Signal<T>, '__isSignal'>>;

type PrimitiveLike = string | number | bigint | boolean | symbol | null | undefined;

export interface FieldRef<T> {
    readonly __isSignal: true;
    readonly value: T;
    peek(): T;
    subscribe(fn: (value: T) => void): () => void;
    map<U>(selector: (value: T) => U): ReadonlySignal<U>;
    valueOf(): T;
    toString(): string;
    [Symbol.toPrimitive](hint: string): PrimitiveLike;
}

class SignalFieldRef<T> implements FieldRef<T> {
    readonly __isSignal = true as const;

    constructor(private readonly signal: SignalLike<T>) {}

    get value(): T {
        return this.signal.peek();
    }

    peek(): T {
        return this.signal.peek();
    }

    subscribe(fn: (value: T) => void): () => void {
        return this.signal.subscribe(fn);
    }

    map<U>(selector: (value: T) => U): ReadonlySignal<U> {
        return computed(() => {
            const readable = this.signal as Signal<T>;
            const currentValue = typeof readable === 'function' ? readable() : this.signal.peek();
            return selector(currentValue);
        });
    }

    valueOf(): T {
        return this.signal.peek();
    }

    toString(): string {
        return String(this.signal.peek());
    }

    [Symbol.toPrimitive](): PrimitiveLike {
        const value = this.signal.peek() as unknown;
        if (value === null || value === undefined) {
            return value;
        }

        switch (typeof value) {
            case 'string':
            case 'number':
            case 'bigint':
            case 'boolean':
            case 'symbol':
                return value;
            default:
                return String(value);
        }
    }
}

export function createFieldRef<T>(signal: SignalLike<T>): FieldRef<T> {
    return new SignalFieldRef(signal);
}
