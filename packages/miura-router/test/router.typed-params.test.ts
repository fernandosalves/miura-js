import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRouter } from '../src/router.js';
import { defineRoute, buildPath } from '../src/route-builder.js';
import type { RouteRenderContext, ParamsSchema } from '../src/types.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRouter(routes: any[], renderFn: (ctx: RouteRenderContext) => void = vi.fn()) {
    return createRouter({ routes, mode: 'memory', render: renderFn });
}

// ── defineRoute ───────────────────────────────────────────────────────────────

describe('defineRoute()', () => {
    it('exposes the RouteRecord as .record', () => {
        const r = defineRoute({ path: '/', component: 'app-home' });
        expect(r.record.path).toBe('/');
        expect(r.record.component).toBe('app-home');
    });

    it('attaches paramsSchema to the record when provided', () => {
        const schema: ParamsSchema<{ id: string }> = {
            safeParse: (data: unknown) => ({ success: true, data: data as { id: string } }),
        };
        const r = defineRoute<{ id: string }>({ path: '/users/:id', component: 'u' }, schema);
        expect(r.record.paramsSchema).toBe(schema);
    });

    it('does not add paramsSchema when schema is omitted', () => {
        const r = defineRoute({ path: '/', component: 'home' });
        expect(r.record.paramsSchema).toBeUndefined();
    });
});

// ── TypedRoute.buildPath() ─────────────────────────────────────────────────────

describe('TypedRoute.buildPath()', () => {
    const userRoute = defineRoute<{ id: string }>({ path: '/users/:id', component: 'u' });
    const postRoute = defineRoute<{ userId: string; postId: string }>({
        path: '/users/:userId/posts/:postId',
        component: 'p',
    });

    it('substitutes a single param', () => {
        expect(userRoute.buildPath({ id: '42' })).toBe('/users/42');
    });

    it('substitutes multiple params', () => {
        expect(postRoute.buildPath({ userId: '1', postId: '99' })).toBe('/users/1/posts/99');
    });

    it('URL-encodes param values', () => {
        expect(userRoute.buildPath({ id: 'hello world' })).toBe('/users/hello%20world');
    });

    it('throws when a required param is missing', () => {
        expect(() => postRoute.buildPath({ userId: '1' } as any)).toThrow(
            /Missing required param "postId"/,
        );
    });

    it('leaves static paths unchanged', () => {
        const home = defineRoute({ path: '/about', component: 'about' });
        expect(home.buildPath({})).toBe('/about');
    });
});

// ── buildPath() standalone ─────────────────────────────────────────────────────

describe('buildPath() standalone', () => {
    it('substitutes params in a pattern', () => {
        expect(buildPath('/a/:x/b/:y', { x: 'foo', y: 'bar' })).toBe('/a/foo/b/bar');
    });

    it('throws for missing param', () => {
        expect(() => buildPath('/a/:x', {})).toThrow(/Missing required param "x"/);
    });
});

// ── TypedRoute.navigate() ─────────────────────────────────────────────────────

describe('TypedRoute.navigate()', () => {
    const userRoute = defineRoute<{ id: string }>({ path: '/users/:id', component: 'user-page' });
    let renders: RouteRenderContext[];

    beforeEach(() => {
        renders = [];
    });

    it('navigates to the correct path', async () => {
        const router = makeRouter([userRoute.record], (ctx) => renders.push(ctx));
        await router.start();

        const result = await userRoute.navigate(router, { id: '7' });
        expect(result.ok).toBe(true);
        expect(renders.at(-1)?.params).toEqual({ id: '7' });
    });

    it('returns not-ok when no matching route exists', async () => {
        const otherRoute = defineRoute({ path: '/', component: 'home' });
        const router = makeRouter([otherRoute.record]);
        await router.start();

        const result = await userRoute.navigate(router, { id: '7' });
        expect(result.ok).toBe(false);
        expect((result as any).reason).toBe('not-found');
    });
});

// ── ParamsSchema validation ────────────────────────────────────────────────────

describe('ParamsSchema runtime validation', () => {
    it('passes params through when schema returns success', async () => {
        const schema: ParamsSchema<{ id: string }> = {
            safeParse: (data) => ({ success: true, data: data as { id: string } }),
        };
        const userRoute = defineRoute<{ id: string }>(
            { path: '/u/:id', component: 'u' }, schema,
        );
        const renders: RouteRenderContext[] = [];
        const router = makeRouter([userRoute.record], (ctx) => renders.push(ctx));
        await router.start();

        const result = await userRoute.navigate(router, { id: '5' });
        expect(result.ok).toBe(true);
        expect(renders.at(-1)?.params).toEqual({ id: '5' });
    });

    it('blocks navigation and returns error when schema fails', async () => {
        const schema: ParamsSchema<{ id: string }> = {
            safeParse: () => ({ success: false, error: { message: 'must be numeric' } }),
        };
        const userRoute = defineRoute<{ id: string }>(
            { path: '/u/:id', component: 'u' }, schema,
        );
        const router = makeRouter([userRoute.record]);
        await router.start();

        const result = await userRoute.navigate(router, { id: 'abc' });
        expect(result.ok).toBe(false);
        expect((result as any).reason).toBe('error');
        expect((result as any).error?.message).toMatch(/must be numeric/);
    });

    it('uses coerced params from schema (e.g. trimmed string)', async () => {
        const schema: ParamsSchema<{ id: string }> = {
            safeParse: (data: any) => ({
                success: true,
                data: { id: (data.id as string).trim() },
            }),
        };
        const userRoute = defineRoute<{ id: string }>(
            { path: '/u/:id', component: 'u' }, schema,
        );
        const renders: RouteRenderContext[] = [];
        const router = makeRouter([userRoute.record], (ctx) => renders.push(ctx));
        await router.start();

        await router.navigate('/u/  42  ');
        expect(renders.at(-1)?.params).toEqual({ id: '42' });
    });
});
