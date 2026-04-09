import { describe, it, expect, vi } from 'vitest';
import { createRouter } from '../src/router.js';
import type { RouteRecord, RouteRenderContext } from '../src/types.js';

const routes: RouteRecord[] = [
    { path: '/', component: 'router-signal-home' },
    {
        path: '/profile/:id',
        component: 'router-signal-profile',
        loaders: [
            ({ params }) => ({ profile: { id: params.id, label: `User ${params.id}` } }),
            async ({ params }) => ({ permissions: [`user:${params.id}`] }),
        ],
    },
];

describe('MiuraRouter route signals', () => {
    it('updates currentSignal after navigation', async () => {
        const renderSpy = vi.fn<(context: RouteRenderContext) => void>();
        const router = createRouter({
            routes,
            mode: 'memory',
            render: (context) => renderSpy(context),
        });

        expect(router.currentSignal()).toBeUndefined();
        await router.start();
        expect(router.currentSignal()?.route.path).toBe('/');

        const result = await router.navigate('/profile/42');
        expect(result.ok).toBe(true);
        expect(router.currentSignal()?.route.path).toBe('/profile/:id');
        expect(router.currentSignal()?.params).toEqual({ id: '42' });

        router.destroy();
    });

    it('select() derives reactive values from route context', async () => {
        const router = createRouter({
            routes,
            mode: 'memory',
            render: () => undefined,
        });

        const pathSignal = router.select((context) => context?.pathname ?? 'none');
        const seen: string[] = [];
        const unsubscribe = pathSignal.subscribe((value) => seen.push(value));

        await router.start();
        await router.navigate('/profile/7');
        await router.navigate('/');

        expect(pathSignal()).toBe('/');
        expect(seen).toContain('/profile/7');
        expect(seen).toContain('/');

        unsubscribe();
        router.destroy();
    });

    it('dataSignal() tracks loader data across navigations', async () => {
        const router = createRouter({
            routes,
            mode: 'memory',
            render: () => undefined,
        });

        const profileSignal = router.dataSignal<{ id: string; label: string }>('profile');
        const permissionSignal = router.dataSignal<string[]>('permissions', []);

        await router.start();
        expect(profileSignal()).toBeUndefined();
        expect(permissionSignal()).toEqual([]);

        await router.navigate('/profile/9');

        expect(profileSignal()).toEqual({ id: '9', label: 'User 9' });
        expect(permissionSignal()).toEqual(['user:9']);

        await router.navigate('/');

        expect(profileSignal()).toBeUndefined();
        expect(permissionSignal()).toEqual([]);

        router.destroy();
    });

    it('dataSignal() can expose the full loader data object', async () => {
        const router = createRouter({
            routes,
            mode: 'memory',
            render: () => undefined,
        });

        const dataSignal = router.dataSignal<{ profile?: { id: string; label: string }; permissions?: string[] }>();

        await router.start();
        expect(dataSignal()).toEqual({});

        await router.navigate('/profile/3');

        expect(dataSignal()).toEqual({
            profile: { id: '3', label: 'User 3' },
            permissions: ['user:3'],
        });

        router.destroy();
    });
});
