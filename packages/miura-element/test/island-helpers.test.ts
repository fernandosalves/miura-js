import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, MiuraIsland, html, readIslandProps, type Resource } from '../index.js';

const waitForMicrotask = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
};

const waitFor = async (check: () => boolean, timeoutMs = 200) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        if (check()) return;
        await waitForMicrotask();
    }
    throw new Error('Timed out waiting for condition');
};

describe('Miura island helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('exposes typed island props to hydrated components', async () => {
        const tagName = 'miura-island-props-consumer';

        class IslandPropsConsumer extends MiuraElement {
            props = this.$islandProps<{ slug: string; post: { title: string } }>();

            protected override template() {
                return html`
                    <p class="slug">${this.props.slug}</p>
                    <p class="title">${this.props.post?.title}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, IslandPropsConsumer);
        }

        const island = document.createElement('miura-island') as MiuraIsland;
        island.setAttribute('component', tagName);
        island.innerHTML = '<script type="application/json">{"slug":"intro","post":{"title":"Server title"}}</script>';

        document.body.appendChild(island);

        const hydrated = island.hydratedElement as IslandPropsConsumer | null;
        expect(hydrated).not.toBeNull();
        await hydrated!.updateComplete;

        expect(readIslandProps<{ slug: string }>(hydrated!)?.slug).toBe('intro');
        expect(hydrated!.shadowRoot?.querySelector('.slug')?.textContent).toBe('intro');
        expect(hydrated!.shadowRoot?.querySelector('.title')?.textContent).toBe('Server title');
    });

    it('hydrates island resources from server props and revalidates on the client', async () => {
        const tagName = 'miura-island-resource-consumer';
        const resolvers: Array<(value: { title: string }) => void> = [];

        class IslandResourceConsumer extends MiuraElement {
            props = this.$islandProps<{ slug: string; post: { title: string } }>();
            post!: Resource<{ title: string }>;

            constructor() {
                super();
                this.post = this.$islandResource(
                    () => this.props.post,
                    () => new Promise<{ title: string }>((resolve) => {
                        resolvers.push(resolve);
                    }),
                    {
                        key: () => ['post', this.props.slug],
                        staleWhileRevalidate: true,
                    },
                );
            }

            protected override template() {
                return html`
                    <p class="title">${this.post.value?.title ?? 'none'}</p>
                    <p class="refreshing">${String(this.post.refreshing)}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, IslandResourceConsumer);
        }

        const island = document.createElement('miura-island') as MiuraIsland;
        island.setAttribute('component', tagName);
        island.innerHTML = '<script type="application/json">{"slug":"intro","post":{"title":"Server title"}}</script>';

        document.body.appendChild(island);

        const hydrated = island.hydratedElement as IslandResourceConsumer | null;
        expect(hydrated).not.toBeNull();
        await hydrated!.updateComplete;
        await waitFor(() => hydrated!.post.key === 'post:intro');

        expect(hydrated!.post.key).toBe('post:intro');
        expect(hydrated!.post.value).toEqual({ title: 'Server title' });
        expect(hydrated!.post.refreshing).toBe(true);
        expect(hydrated!.shadowRoot?.querySelector('.title')?.textContent).toBe('Server title');

        resolvers.shift()?.({ title: 'Client title' });

        await waitFor(() => hydrated!.shadowRoot?.querySelector('.title')?.textContent === 'Client title');

        expect(hydrated!.post.refreshing).toBe(false);
        expect(hydrated!.post.value).toEqual({ title: 'Client title' });
    });

    it('can skip client revalidation for fully static island data', async () => {
        const tagName = 'miura-island-static-consumer';
        let loadCount = 0;

        class StaticIslandConsumer extends MiuraElement {
            props = this.$islandProps<{ post: { title: string } }>();
            post = this.$islandResource(
                () => this.props.post,
                () => {
                    loadCount++;
                    return { title: 'Client title' };
                },
                { revalidate: false },
            );

            protected override template() {
                return html`<p class="title">${this.post.value?.title ?? 'none'}</p>`;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, StaticIslandConsumer);
        }

        const island = document.createElement('miura-island') as MiuraIsland;
        island.setAttribute('component', tagName);
        island.innerHTML = '<script type="application/json">{"post":{"title":"Server only"}}</script>';

        document.body.appendChild(island);

        const hydrated = island.hydratedElement as StaticIslandConsumer | null;
        expect(hydrated).not.toBeNull();
        await hydrated!.updateComplete;
        await waitFor(() => hydrated!.shadowRoot?.querySelector('.title')?.textContent === 'Server only');

        expect(loadCount).toBe(0);
        expect(hydrated!.shadowRoot?.querySelector('.title')?.textContent).toBe('Server only');
    });
});
