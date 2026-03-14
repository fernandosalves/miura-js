import type {
    RouteRecord,
    NavigationOptions,
    NavigationResult,
    ParamsSchema,
} from './types.js';

// ── Typed route builder ────────────────────────────────────────────────────────

/**
 * Minimal router interface required by `TypedRoute.navigate()`.
 * `MiuraRouter` satisfies this; any compatible router will too.
 */
export interface NavigableRouter {
    navigate(path: string, options?: NavigationOptions): Promise<NavigationResult>;
}

/**
 * A typed route definition.  Created by `defineRoute<TParams>()`.
 *
 * Pass `record` to the `routes` array of `createRouter`, then use
 * `buildPath()` / `navigate()` elsewhere for fully-typed navigation.
 */
export interface TypedRoute<TParams extends Record<string, string> = Record<string, string>> {
    /** Raw RouteRecord — add this to `createRouter({ routes })`. */
    readonly record: RouteRecord<TParams>;

    /**
     * Substitute `:param` segments in the route path with the supplied values.
     *
     * ```ts
     * userRoute.buildPath({ id: '42' }) // → '/users/42'
     * ```
     * @throws if a required segment is missing from `params`.
     */
    buildPath(params: TParams): string;

    /**
     * Navigate the router to this route, substituting params into the path.
     *
     * ```ts
     * await userRoute.navigate(router, { id: '42' });
     * ```
     */
    navigate(router: NavigableRouter, params: TParams, options?: NavigationOptions): Promise<NavigationResult>;
}

/**
 * Define a type-safe route.
 *
 * @param config  - Standard RouteRecord fields (without `paramsSchema`).
 * @param schema  - Optional Zod-compatible schema for runtime param validation.
 *
 * ```ts
 * // No runtime validation
 * export const userRoute = defineRoute<{ id: string }>({
 *   path: '/users/:id',
 *   component: 'user-page',
 * });
 *
 * // With Zod schema
 * import { z } from 'zod';
 * const UserParams = z.object({ id: z.string().regex(/^\d+$/) });
 * export const userRoute = defineRoute({ path: '/users/:id', component: 'user-page' }, UserParams);
 *
 * // Usage
 * createRouter({ routes: [userRoute.record, ...] });
 * await userRoute.navigate(router, { id: '42' });
 * userRoute.buildPath({ id: '42' }); // → '/users/42'
 * ```
 */
export function defineRoute<TParams extends Record<string, string> = Record<string, string>>(
    config: Omit<RouteRecord<TParams>, 'paramsSchema'>,
    schema?: ParamsSchema<TParams>,
): TypedRoute<TParams> {
    const record: RouteRecord<TParams> = schema
        ? { ...(config as RouteRecord<TParams>), paramsSchema: schema }
        : (config as RouteRecord<TParams>);

    return {
        record,

        buildPath(params: TParams): string {
            return _interpolate(record.path, params);
        },

        navigate(router: NavigableRouter, params: TParams, options?: NavigationOptions): Promise<NavigationResult> {
            return router.navigate(_interpolate(record.path, params), options);
        },
    };
}

// ── Utility — also exported for standalone use ─────────────────────────────────

/**
 * Substitute `:param` segments in a path pattern with values from `params`.
 *
 * ```ts
 * buildPath('/users/:id/posts/:postId', { id: '1', postId: '99' })
 * // → '/users/1/posts/99'
 * ```
 */
export function buildPath(pattern: string, params: Record<string, string>): string {
    return _interpolate(pattern, params);
}

function _interpolate(pattern: string, params: Record<string, string>): string {
    return pattern.replace(/:(\w+)/g, (_, key) => {
        if (!(key in params)) {
            throw new Error(`[miura-router] Missing required param "${key}" for path "${pattern}"`);
        }
        return encodeURIComponent(params[key]);
    });
}
