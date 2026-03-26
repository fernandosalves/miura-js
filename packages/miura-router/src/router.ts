import type {
    RouterInstance,
    RouterOptions,
    RouterMode,
    RouteContext,
    RouteRenderContext,
    NavigationOptions,
    NavigationResult,
    RouteLoaderConfig,
    RouteLoaderState,
} from './types.js';

import {
    compileRoutes,
    matchRoute,
    parseQuery,
    buildFullPath,
    normalizePath,
    resolvePath,
} from './utils.js';

interface LocationParts {
    pathname: string;
    search: string;
    hash: string;
    fullPath: string;
}

interface InternalNavigationOptions extends NavigationOptions {
    silent?: boolean;
    redirectedFrom?: string;
    depth?: number;
    state?: any;
}

const MAX_REDIRECT_DEPTH = 10;
const EMPTY_LOADER_STATE: RouteLoaderState = {
    status: 'idle',
    data: {},
    entries: {},
};

export class MiuraRouter implements RouterInstance {
    private readonly mode: RouterMode;
    private readonly base: string;
    private readonly fallback?: string;
    private readonly compiledRoutes;
    private running = false;
    private suppressHashChange = false;
    private listeners: Array<() => void> = [];
    private memoryLocation: LocationParts = {
        pathname: '/',
        search: '',
        hash: '',
        fullPath: '/',
    };

    current?: RouteContext;
    previous?: RouteContext | null;

    constructor(private readonly options: RouterOptions) {
        this.mode = options.mode || 'hash';
        this.base = this.normalizeBase(options.base || '/');
        this.fallback = options.fallback;
        this.compiledRoutes = compileRoutes(options.routes || []);
    }

    async start(): Promise<void> {
        if (this.running) return;
        this.running = true;
        this.attachListeners();
        const location = this.getCurrentLocation();
        await this.handleNavigation(location, { replace: true, silent: true });
    }

    stop(): void {
        if (!this.running) return;
        this.detachListeners();
        this.running = false;
    }

    destroy(): void {
        this.stop();
        this.listeners = [];
        this.current = undefined;
        this.previous = null;
    }

    async navigate(target: string, options: NavigationOptions = {}): Promise<NavigationResult> {
        const location = this.resolveTarget(target);
        return this.handleNavigation(location, { ...options });
    }

    async replace(target: string, options: NavigationOptions = {}): Promise<NavigationResult> {
        const location = this.resolveTarget(target);
        return this.handleNavigation(location, { ...options, replace: true });
    }

    back(): void {
        if (typeof window === 'undefined') return;
        window.history.back();
    }

    forward(): void {
        if (typeof window === 'undefined') return;
        window.history.forward();
    }

    private attachListeners(): void {
        if (typeof window === 'undefined') {
            return;
        }

        if (this.mode === 'history') {
            const onPopState = (event: PopStateEvent) => {
                const location = this.getCurrentLocation();
                this.handleNavigation(location, {
                    replace: true,
                    silent: true,
                    state: event.state,
                });
            };
            window.addEventListener('popstate', onPopState);
            this.listeners.push(() => window.removeEventListener('popstate', onPopState));
        } else if (this.mode === 'hash') {
            const onHashChange = () => {
                if (this.suppressHashChange) {
                    this.suppressHashChange = false;
                    return;
                }
                const location = this.getCurrentLocation();
                this.handleNavigation(location, {
                    replace: true,
                    silent: true,
                });
            };
            window.addEventListener('hashchange', onHashChange);
            this.listeners.push(() => window.removeEventListener('hashchange', onHashChange));
        }
    }

    private detachListeners(): void {
        this.listeners.forEach((dispose) => dispose());
        this.listeners = [];
    }

    private async handleNavigation(
        location: LocationParts,
        options: InternalNavigationOptions,
    ): Promise<NavigationResult> {
        try {
            const match = matchRoute(location.pathname, this.compiledRoutes);

            if (!match) {
                if (this.fallback && location.pathname !== this.fallback) {
                    if (options.depth && options.depth > MAX_REDIRECT_DEPTH) {
                        return { ok: false, reason: 'error', error: new Error('Router redirect overflow') };
                    }
                    return this.handleNavigation(this.resolveTarget(this.fallback), {
                        replace: true,
                        ...options,
                        depth: (options.depth || 0) + 1,
                    });
                }
                this.emit('router:not-found', { location });
                return { ok: false, reason: 'not-found' };
            }

            if (match.record.paramsSchema) {
                const result = match.record.paramsSchema.safeParse(match.params);
                if (!result.success) {
                    const msg = (result as any).error?.message ?? 'Invalid route params';
                    return { ok: false, reason: 'error', error: new Error(`[miura-router] Param validation failed: ${msg}`) };
                }
                match.params = (result as any).data;
            }

            const baseContext: RouteContext = {
                route: match.record,
                matched: match.matched,
                pathname: location.pathname,
                fullPath: location.fullPath,
                params: match.params,
                query: parseQuery(location.search),
                hash: location.hash,
                data: {},
                loaders: { ...EMPTY_LOADER_STATE, data: {}, entries: {} },
                timestamp: Date.now(),
            };

            const redirectTarget = await this.resolveRedirect(baseContext, options);
            if (redirectTarget) {
                this.assertRedirectDepth(options.depth);
                return this.handleNavigation(this.resolveTarget(redirectTarget), {
                    ...options,
                    replace: options.replace ?? true,
                    depth: (options.depth || 0) + 1,
                    redirectedFrom: location.fullPath,
                });
            }

            const renderContext: RouteRenderContext = {
                ...baseContext,
                previous: this.current ?? null,
            };

            const guardResult = await this.runGuards(renderContext);
            if (typeof guardResult === 'string') {
                this.assertRedirectDepth(options.depth);
                return this.handleNavigation(this.resolveTarget(guardResult), {
                    ...options,
                    replace: options.replace ?? true,
                    depth: (options.depth || 0) + 1,
                    redirectedFrom: location.fullPath,
                });
            }
            if (guardResult === false) {
                this.emit('router:blocked', { to: renderContext, from: this.current });
                return { ok: false, reason: 'blocked' };
            }

            renderContext.loaders = await this.loadData(renderContext);
            renderContext.data = renderContext.loaders.data;

            if (!options.silent) {
                this.emit('router:navigating', { to: renderContext, from: this.current });
            }

            const stopTimer = this.options.performance?.startTimer?.('router:render');
            try {
                await this.options.render(renderContext);
            } finally {
                stopTimer?.();
            }

            this.previous = this.current ?? null;
            this.current = { ...renderContext };

            if (!options.silent) {
                this.emit('router:navigated', { to: renderContext, from: this.previous });
            }

            this.commitLocation(location, options);

            return { ok: true, context: this.current };
        } catch (error) {
            this.emit('router:error', { error, location });
            return { ok: false, reason: 'error', error: error as Error };
        }
    }

    private async runGuards(context: RouteRenderContext): Promise<boolean | string | void> {
        const guards = context.route.guards || [];
        for (const guard of guards) {
            const result = await guard(context);
            if (typeof result === 'string' || result === false) {
                return result;
            }
        }
        return true;
    }

    private async loadData(context: RouteRenderContext): Promise<RouteLoaderState> {
        const loaders = context.route.loaders || [];
        if (loaders.length === 0) {
            return {
                status: 'idle',
                data: {},
                entries: {},
            };
        }

        const state: RouteLoaderState = {
            status: 'pending',
            data: {},
            entries: {},
        };

        for (let index = 0; index < loaders.length; index++) {
            const loaderConfig = loaders[index];
            const descriptor = this.normalizeLoader(loaderConfig, index);
            state.entries[descriptor.key] = {
                key: descriptor.key,
                status: 'pending',
                optional: descriptor.optional,
            };

            try {
                const result = await descriptor.load(context);
                state.entries[descriptor.key] = {
                    ...state.entries[descriptor.key],
                    status: 'resolved',
                    data: result,
                };

                if (descriptor.named) {
                    state.data[descriptor.key] = result;
                } else if (result && typeof result === 'object') {
                    Object.assign(state.data, result);
                }
            } catch (error) {
                state.entries[descriptor.key] = {
                    ...state.entries[descriptor.key],
                    status: 'rejected',
                    error,
                };
                state.error = error;
                state.status = 'rejected';

                if (!descriptor.optional) {
                    throw error;
                }
            }
        }

        if (state.status !== 'rejected') {
            state.status = 'resolved';
        }

        return state;
    }

    private normalizeLoader(loader: RouteLoaderConfig, index: number): {
        key: string;
        load: (context: RouteRenderContext) => Promise<Record<string, any> | void> | Record<string, any> | void;
        optional?: boolean;
        named: boolean;
    } {
        if (typeof loader === 'function') {
            return {
                key: `loader:${index}`,
                load: loader,
                named: false,
            };
        }

        return {
            key: loader.key || `loader:${index}`,
            load: loader.load,
            optional: loader.optional,
            named: true,
        };
    }

    private resolveTarget(target: string): LocationParts {
        const reference = this.current?.pathname || '/';
        const { path, search, hash } = this.splitTarget(target);
        const pathname = path.startsWith('/')
            ? normalizePath(path)
            : resolvePath(path || '.', reference || '/');
        const normalizedSearch = search.startsWith('?') || search === '' ? search : `?${search}`;
        const normalizedHash = hash.startsWith('#') || hash === '' ? hash : `#${hash}`;
        return {
            pathname,
            search: normalizedSearch,
            hash: normalizedHash,
            fullPath: buildFullPath(pathname, normalizedSearch, normalizedHash),
        };
    }

    private splitTarget(target: string): { path: string; search: string; hash: string } {
        let path = target || '/';
        let search = '';
        let hash = '';

        const hashIndex = path.indexOf('#');
        if (hashIndex >= 0) {
            hash = path.slice(hashIndex);
            path = path.slice(0, hashIndex) || '/';
        }

        const queryIndex = path.indexOf('?');
        if (queryIndex >= 0) {
            search = path.slice(queryIndex);
            path = path.slice(0, queryIndex) || '/';
        }

        return { path, search, hash };
    }

    private async resolveRedirect(
        context: RouteContext,
        options: InternalNavigationOptions,
    ): Promise<string | null> {
        const redirect = context.route.redirect;
        if (!redirect) return null;
        this.assertRedirectDepth(options.depth);
        if (typeof redirect === 'function') {
            const target = redirect(context);
            return target || null;
        }
        return redirect;
    }

    private assertRedirectDepth(depth?: number): void {
        if ((depth || 0) >= MAX_REDIRECT_DEPTH) {
            throw new Error('Router redirect overflow');
        }
    }

    private commitLocation(location: LocationParts, options: InternalNavigationOptions): void {
        if (options.silent) {
            if (this.mode === 'memory') {
                this.memoryLocation = location;
            }
            return;
        }

        if (this.mode === 'history' && typeof window !== 'undefined') {
            const method = options.replace ? 'replaceState' : 'pushState';
            const fullPath = this.applyBase(location.pathname) + location.search + location.hash;
            window.history[method](options.state ?? {}, '', fullPath || '/');
        } else if (this.mode === 'hash' && typeof window !== 'undefined') {
            const target = '#' + this.applyBase(location.pathname).replace(/^\//, '') + location.search + location.hash;
            if (options.replace) {
                const { pathname, search } = window.location;
                window.history.replaceState(options.state ?? window.history.state, '', `${pathname}${search}${target}`);
            } else {
                this.suppressHashChange = true;
                window.location.hash = target;
            }
        } else if (this.mode === 'memory') {
            this.memoryLocation = location;
        }
    }

    private getCurrentLocation(): LocationParts {
        if (typeof window === 'undefined') {
            return this.memoryLocation;
        }

        if (this.mode === 'hash') {
            const raw = window.location.hash.replace(/^#/, '') || '/';
            return this.parseFullPath(raw);
        }

        const pathname = this.stripBase(window.location.pathname) || '/';
        const search = window.location.search || '';
        const hash = window.location.hash || '';
        const fullPath = buildFullPath(pathname, search, hash);
        return { pathname, search, hash, fullPath };
    }

    private parseFullPath(full: string): LocationParts {
        const { path, search, hash } = this.splitTarget(full);
        const pathname = normalizePath(path);
        return {
            pathname,
            search,
            hash,
            fullPath: buildFullPath(pathname, search, hash),
        };
    }

    private stripBase(pathname: string): string {
        if (this.base === '/' || !pathname.startsWith(this.base)) {
            return pathname;
        }
        const stripped = pathname.slice(this.base.length);
        return stripped.startsWith('/') ? stripped : `/${stripped}`;
    }

    private applyBase(pathname: string): string {
        if (this.base === '/' || pathname.startsWith(this.base)) {
            return pathname;
        }
        const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
        return this.base.replace(/\/$/, '') + normalized;
    }

    private normalizeBase(base: string): string {
        if (!base) return '/';
        if (!base.startsWith('/')) {
            base = `/${base}`;
        }
        return base.endsWith('/') && base.length > 1 ? base.slice(0, -1) : base;
    }

    private emit(type: string, data?: any, priority = 5): void {
        this.options.eventBus?.emit(type, data, priority);
    }
}

export function createRouter(options: RouterOptions): RouterInstance {
    return new MiuraRouter(options);
}
