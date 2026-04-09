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
});
