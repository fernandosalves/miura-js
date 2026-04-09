import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html } from '../index.js';
import { createRouter, type RouteRenderContext } from '@miurajs/miura-router';

const waitForMicrotask = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
};

const waitFor = async (check: () => boolean, timeoutMs = 150) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        if (check()) return;
        await waitForMicrotask();
    }
    throw new Error('Timed out waiting for condition');
};

describe('MiuraElement router bridge helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('binds route context and loader data into component templates', async () => {
        const tagName = 'miura-router-bridge-element';
        const renderContexts: RouteRenderContext[] = [];

        const router = createRouter({
            mode: 'memory',
            routes: [
                { path: '/', component: 'app-home' },
                {
                    path: '/profile/:id',
                    component: 'app-profile',
                    loaders: [
                        ({ params }) => ({ profile: { id: params.id, name: `User ${params.id}` } }),
                    ],
                },
            ],
            render: (context) => {
                renderContexts.push(context);
            },
        });

        class RouterBridgeElement extends MiuraElement {
            route = this.$route<RouteRenderContext>(router);
            pathname = this.$routeSelect(router, (context) => (context as RouteRenderContext | undefined)?.pathname ?? 'none');
            componentName = this.$routeSelect(router, (context) => (context as RouteRenderContext | undefined)?.route.component ?? 'none');
            profileName = this.$routeSelect(
                router,
                (context) => ((context as RouteRenderContext | undefined)?.data.profile as { name?: string } | undefined)?.name ?? 'missing',
            );
            profile = this.$routeData<{ id: string; name: string }>(router, 'profile');

            protected override template() {
                return html`
                    <p class="pathname">${this.pathname}</p>
                    <p class="component">${this.componentName}</p>
                    <p class="profile">${this.profileName}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, RouterBridgeElement);
        }

        await router.start();

        const element = document.createElement(tagName) as RouterBridgeElement;
        document.body.appendChild(element);
        await element.updateComplete;

        expect(element.shadowRoot?.querySelector('.pathname')?.textContent).toBe('/');
        expect(element.shadowRoot?.querySelector('.component')?.textContent).toBe('app-home');
        expect(element.shadowRoot?.querySelector('.profile')?.textContent).toBe('missing');

        await router.navigate('/profile/12');
        await waitFor(() => element.shadowRoot?.querySelector('.profile')?.textContent === 'User 12');

        expect(renderContexts.at(-1)?.route.component).toBe('app-profile');
        expect(element.route.peek()?.route.component).toBe('app-profile');
        expect(element.profile.peek()?.name).toBe('User 12');
        expect(element.shadowRoot?.querySelector('.pathname')?.textContent).toBe('/profile/12');
        expect(element.shadowRoot?.querySelector('.component')?.textContent).toBe('app-profile');
        expect(element.shadowRoot?.querySelector('.profile')?.textContent).toBe('User 12');

        router.destroy();
    });

    it('can expose the full route loader data object as a signal', async () => {
        const tagName = 'miura-router-data-object';

        const router = createRouter({
            mode: 'memory',
            routes: [
                { path: '/', component: 'app-home' },
                {
                    path: '/profile/:id',
                    component: 'app-profile',
                    loaders: [
                        ({ params }) => ({ profile: { id: params.id, name: `User ${params.id}` } }),
                        ({ params }) => ({ permissions: [`profile:${params.id}`] }),
                    ],
                },
            ],
            render: () => undefined,
        });

        class RouteDataObjectElement extends MiuraElement {
            data = this.$routeData<{ profile?: { id: string; name: string }; permissions?: string[] }>(router);

            protected override template() {
                return html`<p class="status">ready</p>`;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, RouteDataObjectElement);
        }

        await router.start();
        const element = document.createElement(tagName) as RouteDataObjectElement;
        document.body.appendChild(element);
        await element.updateComplete;

        expect(element.data.peek()).toEqual({});

        await router.navigate('/profile/5');
        await waitFor(() => element.data.peek()?.profile?.name === 'User 5');

        expect(element.data.peek()).toEqual({
            profile: { id: '5', name: 'User 5' },
            permissions: ['profile:5'],
        });
        router.destroy();
    });

    it('can create route-driven resources that refresh when params change', async () => {
        const tagName = 'miura-route-resource-element';
        let loadCount = 0;

        const router = createRouter({
            mode: 'memory',
            routes: [
                { path: '/', component: 'app-home' },
                { path: '/profile/:id', component: 'app-profile' },
            ],
            render: () => undefined,
        });

        class RouteResourceElement extends MiuraElement {
            user = this.$routeResource(
                router,
                (context) => (context as RouteRenderContext | undefined)?.params.id,
                async (id) => {
                    loadCount++;
                    return { id, label: `User ${id}` };
                },
                { skip: (id) => !id },
            );

            protected override template() {
                return this.user.view({
                    idle: () => html`<p class="state">idle</p>`,
                    pending: () => html`<p class="state">pending</p>`,
                    ok: (user) => html`<p class="state">${user.label}</p>`,
                });
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, RouteResourceElement);
        }

        await router.start();

        const element = document.createElement(tagName) as RouteResourceElement;
        document.body.appendChild(element);
        await element.updateComplete;

        expect(element.shadowRoot?.querySelector('.state')?.textContent).toBe('idle');

        await router.navigate('/profile/21');
        await waitFor(() => element.shadowRoot?.querySelector('.state')?.textContent === 'User 21');

        expect(element.user.value).toEqual({ id: '21', label: 'User 21' });

        await router.navigate('/profile/22');
        await waitFor(() => element.shadowRoot?.querySelector('.state')?.textContent === 'User 22');

        expect(element.user.value).toEqual({ id: '22', label: 'User 22' });
        expect(element.user.key).toBe('route:22');
        expect(loadCount).toBe(2);

        router.destroy();
    });

    it('can hydrate and revalidate route resources from loader data', async () => {
        const tagName = 'miura-route-resource-hydrated';
        let loadCount = 0;
        const resolvers: Array<(value: { slug: string | undefined; title: string }) => void> = [];

        const router = createRouter({
            mode: 'memory',
            routes: [
                { path: '/', component: 'app-home' },
                {
                    path: '/post/:slug',
                    component: 'app-post',
                    loaders: [
                        ({ params }) => ({ post: { slug: params.slug, title: `Loader ${params.slug}` } }),
                    ],
                },
            ],
            render: () => undefined,
        });

        class RouteHydratedResourceElement extends MiuraElement {
            post = this.$routeResource(
                router,
                (context) => (context as RouteRenderContext | undefined)?.params.slug,
                (slug) => new Promise<{ slug: string | undefined; title: string }>((resolve) => {
                    loadCount++;
                    resolvers.push(resolve);
                }),
                {
                    skip: (slug) => !slug,
                    hydrateFromRouteData: 'post',
                    staleWhileRevalidate: true,
                },
            );

            protected override template() {
                return html`
                    <p class="title">${this.post.value?.title ?? 'none'}</p>
                    <p class="refreshing">${String(this.post.refreshing)}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, RouteHydratedResourceElement);
        }

        await router.start();

        const element = document.createElement(tagName) as RouteHydratedResourceElement;
        document.body.appendChild(element);
        await element.updateComplete;

        await router.navigate('/post/intro');
        resolvers.shift()?.({ slug: 'intro', title: 'Fetched intro' });
        await waitFor(() => element.shadowRoot?.querySelector('.title')?.textContent === 'Fetched intro');

        expect(loadCount).toBe(1);
        expect(element.post.key).toBe('route:intro');
        expect(element.post.refreshing).toBe(false);

        await router.navigate('/');
        await router.navigate('/post/intro');
        await waitFor(() => element.shadowRoot?.querySelector('.title')?.textContent === 'Loader intro');

        expect(element.post.refreshing).toBe(true);
        expect(loadCount).toBe(2);

        resolvers.shift()?.({ slug: 'intro', title: 'Fetched intro' });
        await waitFor(() => element.shadowRoot?.querySelector('.title')?.textContent === 'Fetched intro');
        expect(element.post.refreshing).toBe(false);

        router.destroy();
    });

    it('can hydrate route resources from the full route data object', async () => {
        const tagName = 'miura-route-resource-full-hydration';
        let loadCount = 0;
        const resolvers: Array<(value: { profile: { id: string | undefined; name: string } }) => void> = [];

        const router = createRouter({
            mode: 'memory',
            routes: [
                { path: '/', component: 'app-home' },
                {
                    path: '/profile/:id',
                    component: 'app-profile',
                    loaders: [
                        ({ params }) => ({ profile: { id: params.id, name: `Loader ${params.id}` } }),
                    ],
                },
            ],
            render: () => undefined,
        });

        class FullHydrationElement extends MiuraElement {
            profile = this.$routeResource(
                router,
                (context) => (context as RouteRenderContext | undefined)?.params.id,
                (id) => new Promise<{ profile: { id: string | undefined; name: string } }>((resolve) => {
                    loadCount++;
                    resolvers.push(resolve);
                }),
                {
                    skip: (id) => !id,
                    hydrateFromRouteData: true,
                    staleWhileRevalidate: true,
                },
            );

            protected override template() {
                return html`<p class="name">${this.profile.value?.profile?.name ?? 'none'}</p>`;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, FullHydrationElement);
        }

        await router.start();
        const element = document.createElement(tagName) as FullHydrationElement;
        document.body.appendChild(element);
        await element.updateComplete;

        await router.navigate('/profile/8');
        await waitFor(() => element.shadowRoot?.querySelector('.name')?.textContent === 'Loader 8');

        expect(loadCount).toBe(1);

        resolvers.shift()?.({ profile: { id: '8', name: 'Fetched 8' } });
        await waitFor(() => element.shadowRoot?.querySelector('.name')?.textContent === 'Fetched 8');

        router.destroy();
    });
});
