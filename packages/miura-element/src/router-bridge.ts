export interface RouteSignalLike<T> {
    (): T;
    subscribe(fn: (value: T) => void): () => void;
    peek(): T;
    readonly __isSignal: true;
}

export interface RouterBridgeLike {
    readonly currentSignal: RouteSignalLike<unknown>;
    select<T>(selector: (context: unknown) => T): RouteSignalLike<T>;
    dataSignal<T = unknown>(key: string, fallback?: T): RouteSignalLike<T | undefined>;
}
