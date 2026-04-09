import type { RouteContext } from './types.js';

export interface RouteSignal<T> {
    (): T;
    subscribe(fn: (value: T) => void): () => void;
    peek(): T;
    readonly __isSignal: true;
}

interface WritableRouteSignal<T> extends RouteSignal<T> {
    (value: T): void;
}

export function createRouteSignal<T>(initial: T): WritableRouteSignal<T> {
    let value = initial;
    const subscribers = new Set<(value: T) => void>();

    function signal(): T;
    function signal(next: T): void;
    function signal(next?: T): T | void {
        if (arguments.length === 0) {
            return value;
        }

        if (Object.is(value, next)) {
            return;
        }

        value = next as T;
        subscribers.forEach((subscriber) => subscriber(value));
    }

    signal.subscribe = (subscriber: (value: T) => void) => {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
    };
    signal.peek = () => value;
    (signal as any).__isSignal = true;

    return signal as WritableRouteSignal<T>;
}

export function createDerivedRouteSignal<TSource, TResult>(
    source: RouteSignal<TSource>,
    selector: (value: TSource) => TResult,
): RouteSignal<TResult> {
    let cached = selector(source.peek());
    const subscribers = new Set<(value: TResult) => void>();

    source.subscribe((value) => {
        const next = selector(value);
        if (Object.is(cached, next)) {
            return;
        }

        cached = next;
        subscribers.forEach((subscriber) => subscriber(cached));
    });

    const signal = (() => cached) as RouteSignal<TResult>;
    signal.subscribe = (subscriber) => {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
    };
    signal.peek = () => cached;
    (signal as any).__isSignal = true;

    return signal;
}

export function createRouteDataSignal<T = unknown>(
    source: RouteSignal<RouteContext | undefined>,
    key?: string,
    fallback?: T,
): RouteSignal<T | undefined> {
    return createDerivedRouteSignal(source, (context) => {
        if (!key) {
            return (context?.data as T | undefined) ?? fallback;
        }

        const value = context?.data?.[key] as T | undefined;
        return value === undefined ? fallback : value;
    });
}
