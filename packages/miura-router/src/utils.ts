import type { RouteRecord } from './types';

export interface CompiledRoute {
    record: RouteRecord;
    pattern: RegExp;
    keys: string[];
    fullPath: string;
    /** Parent records from root down to (but not including) this record */
    ancestors: RouteRecord[];
}

export interface MatchResult {
    record: RouteRecord;
    params: Record<string, string>;
    /** Full ancestry chain from root layout down to the matched leaf */
    matched: RouteRecord[];
}

export const DEFAULT_RENDER_ZONE_SELECTORS = [
    '[data-router-zone="primary"]',
    '[data-router-zone="default"]',
    '[data-router-zone]',
    '#main-content',
    'main',
];

export function normalizePath(path: string): string {
    if (!path) return '/';
    const cleaned = path.replace(/\/+/g, '/');
    if (!cleaned.startsWith('/')) {
        return `/${cleaned}`;
    }
    return cleaned.length > 1 && cleaned.endsWith('/') ? cleaned.slice(0, -1) : cleaned;
}

export function resolvePath(target: string, current: string): string {
    if (!target) return current;
    if (target.startsWith('/')) {
        return normalizePath(target);
    }
    const segments = current.split('/').concat(target.split('/'));
    const resolved: string[] = [];
    for (const segment of segments) {
        if (!segment || segment === '.') continue;
        if (segment === '..') {
            resolved.pop();
            continue;
        }
        resolved.push(segment);
    }
    return '/' + resolved.join('/');
}

export function compileRoutes(
    routes: RouteRecord[],
    parentPath: string = '',
    ancestors: RouteRecord[] = [],
): CompiledRoute[] {
    const compiled: CompiledRoute[] = [];

    for (const route of routes) {
        const fullPath = normalizePath(`${parentPath}/${route.path}`);
        const { pattern, keys } = compilePath(fullPath);
        compiled.push({ record: route, pattern, keys, fullPath, ancestors });

        if (route.children?.length) {
            compiled.push(...compileRoutes(route.children, fullPath, [...ancestors, route]));
        }
    }

    return compiled;
}

export function matchRoute(pathname: string, compiledRoutes: CompiledRoute[]): MatchResult | null {
    for (const compiled of compiledRoutes) {
        const match = compiled.pattern.exec(pathname);
        if (!match) continue;

        const params: Record<string, string> = {};
        compiled.keys.forEach((key, index) => {
            params[key] = decodeURIComponent(match[index + 1] || '');
        });

        return {
            record: compiled.record,
            params,
            matched: [...compiled.ancestors, compiled.record],
        };
    }
    return null;
}

export function compilePath(path: string): { pattern: RegExp; keys: string[] } {
    const keys: string[] = [];
    const segments = path
        .replace(/\/+/g, '/')
        .replace(/:(\w+)/g, (_, key: string) => {
            keys.push(key);
            return '([^/]+)';
        })
        .replace(/\*/g, () => {
            keys.push('wildcard');
            return '(.*)';
        });

    const pattern = new RegExp(`^${segments.replace(/\//g, '\\/')}\/?$`);
    return { pattern, keys };
}

export function parseQuery(search: string): URLSearchParams {
    return new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
}

export function buildFullPath(pathname: string, search: string, hash: string): string {
    const normalizedSearch = search ? (search.startsWith('?') ? search : `?${search}`) : '';
    const normalizedHash = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '';
    return `${pathname}${normalizedSearch}${normalizedHash}`;
}

export function getHashPath(): string {
    if (typeof window === 'undefined') return '/';
    const value = window.location.hash.replace(/^#/, '');
    return value ? normalizePath(value) : '/';
}

export function getHistoryPath(): string {
    if (typeof window === 'undefined') return '/';
    const { pathname, search, hash } = window.location;
    return normalizePath(`${pathname}${search}${hash}`);
}
