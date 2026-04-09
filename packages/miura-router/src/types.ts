import type { RouteSignal } from './route-signals.js';

export type RouteDataRecord = Record<string, any>;

export type RouterMode = 'hash' | 'history' | 'memory';

/**
 * Minimal Zod-compatible schema interface.
 * Avoids a hard dependency on Zod — pass any schema whose `safeParse`
 * returns `{ success, data }` / `{ success, error }` (Zod, Valibot, etc.).
 */
export interface ParamsSchema<TParams> {
    safeParse(data: unknown): { success: true; data: TParams } | { success: false; error: { message: string } };
}

export interface RouteLoaderEntryState {
    key: string;
    status: 'pending' | 'resolved' | 'rejected';
    data?: unknown;
    error?: unknown;
    optional?: boolean;
}

export interface RouteLoaderState {
    status: 'idle' | 'pending' | 'resolved' | 'rejected';
    data: Record<string, any>;
    entries: Record<string, RouteLoaderEntryState>;
    error?: unknown;
}

export interface RouteMeta extends Record<string, any> {
    title?: string | ((context: RouteRenderContext) => string | undefined | null);
}

export interface RouteRecord<
    TParams extends Record<string, string> = Record<string, string>,
    TData extends RouteDataRecord = RouteDataRecord
> {
    path: string;
    component: string;
    renderZone?: string;
    slot?: string;
    meta?: RouteMeta;
    props?: Record<string, any>;
    guards?: RouteGuard[];
    loaders?: RouteLoaderConfig[];
    redirect?: string | ((context: RouteContext) => string);
    children?: RouteRecord[];
    /**
     * Optional Zod-compatible schema for runtime param validation.
     * Set via `defineRoute<TParams>(config, schema)` — params are
     * validated (and optionally coerced) after every route match.
     */
    paramsSchema?: ParamsSchema<TParams>;
    /** Phantom field so loader data can be carried through types without affecting runtime. */
    __dataType?: TData;
}

export interface RouterEventBus {
    emit(type: string, data?: any, priority?: number): void;
}

export interface RouterPerformance {
    startTimer(name: string): () => void;
}

export interface RouteLocation {
    pathname: string;
    search: string;
    hash: string;
    fullPath: string;
}

export interface RouteContext<
    TParams extends Record<string, string> = Record<string, string>,
    TData extends RouteDataRecord = RouteDataRecord
> {
    route: RouteRecord<TParams, TData>;
    /** Full matched chain from root layout to leaf — use for nested outlet rendering */
    matched: RouteRecord[];
    pathname: string;
    fullPath: string;
    params: TParams;
    query: URLSearchParams;
    hash: string;
    data: TData;
    loaders: RouteLoaderState;
    timestamp: number;
}

export interface RouteRenderContext<
    TParams extends Record<string, string> = Record<string, string>,
    TData extends RouteDataRecord = RouteDataRecord
> extends RouteContext<TParams, TData> {
    previous?: RouteContext | null;
}

export type RouteGuard = (
    context: RouteRenderContext
) => boolean | string | void | Promise<boolean | string | void>;

export type RouteLoader = (
    context: RouteRenderContext
) => Promise<Record<string, any> | void> | Record<string, any> | void;

export interface NamedRouteLoader {
    key: string;
    load: RouteLoader;
    optional?: boolean;
}

export type RouteLoaderConfig = RouteLoader | NamedRouteLoader;

export interface RouterOptions {
    routes: RouteRecord[];
    mode?: RouterMode;
    base?: string;
    fallback?: string;
    render: (context: RouteRenderContext) => Promise<void> | void;
    eventBus?: RouterEventBus;
    performance?: RouterPerformance;
}

export interface NavigationOptions {
    replace?: boolean;
    silent?: boolean;
    state?: any;
}

export interface NavigationSuccess {
    ok: true;
    context: RouteContext;
}

export interface NavigationFailure {
    ok: false;
    reason: 'blocked' | 'not-found' | 'error';
    error?: Error;
}

export type NavigationResult = NavigationSuccess | NavigationFailure;

export interface Router {
    readonly current?: RouteContext;
    readonly previous?: RouteContext | null;
    readonly currentSignal: RouteSignal<RouteContext | undefined>;
    start(): Promise<void>;
    stop(): void;
    destroy(): void;
    select<T>(selector: (context: RouteContext | undefined) => T): RouteSignal<T>;
    dataSignal<TData = RouteDataRecord>(): RouteSignal<TData | undefined>;
    dataSignal<T = unknown>(key: string, fallback?: T): RouteSignal<T | undefined>;
    navigate(target: string, options?: NavigationOptions): Promise<NavigationResult>;
    replace(target: string, options?: NavigationOptions): Promise<NavigationResult>;
    back(): void;
    forward(): void;
}

export interface RouterInstance extends Router { }

export type RouteDataOf<TRoute> =
    TRoute extends { record: RouteRecord<any, infer TData> }
        ? TData
        : TRoute extends RouteRecord<any, infer TData>
            ? TData
            : never;
