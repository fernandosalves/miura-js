import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRouter } from '../src/router.js';
import type {
    RouteRecord,
    RouteRenderContext,
    RouterEventBus,
    RouterInstance,
} from '../src/types.js';

const routes: RouteRecord[] = [
    { path: '/', component: 'router-sandbox-home' },
    { path: '/login', component: 'router-sandbox-login' },
    {
        path: '/admin',
        component: 'router-sandbox-admin',
        guards: [() => '/login'],
    },
    {
        path: '/reports',
        component: 'router-sandbox-reports',
        guards: [() => false],
    },
    {
        path: '/profile/:id',
        component: 'router-sandbox-profile',
        loaders: [
            ({ params }) => ({ profile: { id: params.id } }),
            async () => ({ permissions: ['view', 'edit'] }),
        ],
    },
];

describe('MiuraRouter guards and loaders', () => {
    let renderSpy: ReturnType<typeof vi.fn<(context: RouteRenderContext) => void>>;
    let eventBus: RouterEventBus;

    const createTestRouter = (): RouterInstance =>
        createRouter({
            routes,
            mode: 'memory',
            eventBus,
            render: (context) => renderSpy(context),
        });

    beforeEach(() => {
        renderSpy = vi.fn<(context: RouteRenderContext) => void>();
        eventBus = {
            emit: vi.fn(),
        } satisfies RouterEventBus;
    });

    it('redirects when a guard returns a path string', async () => {
        const router = createTestRouter();
        await router.start();
        renderSpy.mockClear();
        (eventBus.emit as ReturnType<typeof vi.fn>).mockClear();

        const result = await router.navigate('/admin');

        expect(result.ok).toBe(true);
        const calls = renderSpy.mock.calls;
        const context = calls[calls.length - 1]?.[0];
        expect(context?.route.path).toBe('/login');

        const eventNames = (eventBus.emit as ReturnType<typeof vi.fn>).mock.calls.map(
            ([type]) => type,
        );
        expect(eventNames).toContain('router:navigating');
        expect(eventNames).toContain('router:navigated');

        router.destroy();
    });

    it('blocks navigation when a guard returns false', async () => {
        const router = createTestRouter();
        await router.start();
        renderSpy.mockClear();
        (eventBus.emit as ReturnType<typeof vi.fn>).mockClear();

        const result = await router.navigate('/reports');

        expect(result.ok).toBe(false);
        expect(result.reason).toBe('blocked');
        expect(renderSpy).not.toHaveBeenCalled();
        const eventNames = (eventBus.emit as ReturnType<typeof vi.fn>).mock.calls.map(
            ([type]) => type,
        );
        expect(eventNames).toContain('router:blocked');

        router.destroy();
    });

    it('merges loader data before rendering the route component', async () => {
        const router = createTestRouter();
        await router.start();
        renderSpy.mockClear();
        (eventBus.emit as ReturnType<typeof vi.fn>).mockClear();

        const result = await router.navigate('/profile/42?tab=about');

        expect(result.ok).toBe(true);
        const calls = renderSpy.mock.calls;
        const context = calls[calls.length - 1]?.[0];
        expect(context?.route.path).toBe('/profile/:id');
        expect(context?.params).toMatchObject({ id: '42' });
        expect(context?.data).toEqual({
            profile: { id: '42' },
            permissions: ['view', 'edit'],
        });

        router.destroy();
    });
});
