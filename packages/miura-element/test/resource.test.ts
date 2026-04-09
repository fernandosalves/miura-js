import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, clearResourceCache, hasResourceCache, html, resourceKey, type Resource } from '../index.js';

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

describe('MiuraElement $resource', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        clearResourceCache();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        clearResourceCache();
    });

    it('auto-loads and rerenders through pending and resolved states', async () => {
        const tagName = 'miura-resource-basic';
        let resolveUser!: (value: { name: string }) => void;

        class ResourceElement extends MiuraElement {
            user!: Resource<{ name: string }>;

            constructor() {
                super();
                this.user = this.$resource(() => new Promise<{ name: string }>((resolve) => {
                    resolveUser = resolve;
                }));
            }

            protected override template() {
                return this.user.view({
                    pending: () => html`<p class="pending">Loading</p>`,
                    ok: (user) => html`<p class="resolved">${user.name}</p>`,
                });
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, ResourceElement);
        }

        const element = document.createElement(tagName) as ResourceElement;
        document.body.appendChild(element);

        await element.updateComplete;
        expect(element.shadowRoot?.querySelector('.pending')?.textContent).toBe('Loading');

        resolveUser({ name: 'Fernando' });
        await waitFor(() => element.shadowRoot?.querySelector('.resolved')?.textContent === 'Fernando');

        expect(element.user.state).toBe('resolved');
        expect(element.shadowRoot?.querySelector('.resolved')?.textContent).toBe('Fernando');
    });

    it('supports refresh and latest-request-wins behavior', async () => {
        const tagName = 'miura-resource-refresh';

        class ResourceRefreshElement extends MiuraElement {
            user!: Resource<string>;
            private loaders: Array<() => void> = [];
            private currentValue = 'first';

            constructor() {
                super();
                this.user = this.$resource(() => new Promise<string>((resolve) => {
                    this.loaders.push(() => resolve(this.currentValue));
                }), { auto: false });
            }

            releaseNext(value: string) {
                this.currentValue = value;
                const release = this.loaders.shift();
                release?.();
            }

            protected override template() {
                return this.user.view({
                    idle: () => html`<p class="idle">Idle</p>`,
                    pending: () => html`<p class="pending">Loading</p>`,
                    ok: (value) => html`<p class="resolved">${value}</p>`,
                    error: (error) => html`<p class="error">${String(error)}</p>`,
                });
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, ResourceRefreshElement);
        }

        const element = document.createElement(tagName) as ResourceRefreshElement;
        document.body.appendChild(element);
        await element.updateComplete;

        expect(element.shadowRoot?.querySelector('.idle')?.textContent).toBe('Idle');

        const first = element.user.refresh();
        await element.updateComplete;
        expect(element.user.state).toBe('pending');

        const second = element.user.refresh();
        await element.updateComplete;

        element.releaseNext('stale');
        await first;
        await waitForMicrotask();
        expect(element.user.state).toBe('pending');

        element.releaseNext('fresh');
        await second;
        await waitFor(() => element.shadowRoot?.querySelector('.resolved')?.textContent === 'fresh');

        expect(element.user.state).toBe('resolved');
        expect(element.user.value).toBe('fresh');
        expect(element.shadowRoot?.querySelector('.resolved')?.textContent).toBe('fresh');
    });

    it('tracks rejected state and can recover on refresh', async () => {
        const tagName = 'miura-resource-error';

        class ResourceErrorElement extends MiuraElement {
            user!: Resource<string>;
            shouldFail = true;

            constructor() {
                super();
                this.user = this.$resource(async () => {
                    if (this.shouldFail) {
                        throw new Error('boom');
                    }
                    return 'ok';
                }, { auto: false });
            }

            protected override template() {
                return this.user.view({
                    idle: () => html`<p class="idle">Idle</p>`,
                    pending: () => html`<p class="pending">Loading</p>`,
                    ok: (value) => html`<p class="resolved">${value}</p>`,
                    error: (error) => html`<p class="error">${(error as Error).message}</p>`,
                });
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, ResourceErrorElement);
        }

        const element = document.createElement(tagName) as ResourceErrorElement;
        document.body.appendChild(element);
        await element.updateComplete;

        await expect(element.user.refresh()).rejects.toThrow('boom');
        await waitFor(() => element.shadowRoot?.querySelector('.error')?.textContent === 'boom');

        expect(element.user.state).toBe('rejected');
        expect(element.shadowRoot?.querySelector('.error')?.textContent).toBe('boom');

        element.shouldFail = false;
        await element.user.refresh();
        await waitFor(() => element.shadowRoot?.querySelector('.resolved')?.textContent === 'ok');

        expect(element.user.state).toBe('resolved');
        expect(element.shadowRoot?.querySelector('.resolved')?.textContent).toBe('ok');
    });

    it('shares keyed cache entries across components and dedupes in-flight loads', async () => {
        const providerTag = 'miura-resource-cache-a';
        const consumerTag = 'miura-resource-cache-b';
        let loadCount = 0;
        let resolveUser!: (value: string) => void;

        class CacheA extends MiuraElement {
            user!: Resource<string>;

            constructor() {
                super();
                this.user = this.$resource(() => new Promise<string>((resolve) => {
                    loadCount++;
                    resolveUser = resolve;
                }), { key: ['profile', 7] });
            }

            protected override template() {
                return this.user.view({
                    pending: () => html`<p class="value">Loading</p>`,
                    ok: (value) => html`<p class="value">${value}</p>`,
                });
            }
        }

        class CacheB extends MiuraElement {
            user!: Resource<string>;

            constructor() {
                super();
                this.user = this.$resource(() => {
                    loadCount++;
                    return 'Should not run twice';
                }, { key: resourceKey('profile', 7) });
            }

            protected override template() {
                return this.user.view({
                    pending: () => html`<p class="value">Loading</p>`,
                    ok: (value) => html`<p class="value">${value}</p>`,
                });
            }
        }

        if (!customElements.get(providerTag)) customElements.define(providerTag, CacheA);
        if (!customElements.get(consumerTag)) customElements.define(consumerTag, CacheB);

        const first = document.createElement(providerTag) as CacheA;
        const second = document.createElement(consumerTag) as CacheB;
        document.body.append(first, second);

        await Promise.all([first.updateComplete, second.updateComplete]);

        expect(loadCount).toBe(1);
        expect(first.user.key).toBe('profile:7');
        expect(second.user.key).toBe('profile:7');
        expect(hasResourceCache(['profile', 7])).toBe(true);
        expect(first.user.promise).toBe(second.user.promise);

        resolveUser('Fernando');

        await waitFor(() => second.shadowRoot?.querySelector('.value')?.textContent === 'Fernando');

        expect(first.shadowRoot?.querySelector('.value')?.textContent).toBe('Fernando');
        expect(second.shadowRoot?.querySelector('.value')?.textContent).toBe('Fernando');
        expect(loadCount).toBe(1);
    });

    it('invalidates keyed caches and reloads fresh data on next refresh', async () => {
        const tagName = 'miura-resource-invalidate';
        let currentValue = 'first';
        let loadCount = 0;

        class InvalidateResourceElement extends MiuraElement {
            user!: Resource<string>;

            constructor() {
                super();
                this.user = this.$resource(() => {
                    loadCount++;
                    return currentValue;
                }, { key: ['profile', 9], auto: false });
            }

            protected override template() {
                return this.user.view({
                    idle: () => html`<p class="value">Idle</p>`,
                    pending: () => html`<p class="value">Loading</p>`,
                    ok: (value) => html`<p class="value">${value}</p>`,
                });
            }
        }

        if (!customElements.get(tagName)) customElements.define(tagName, InvalidateResourceElement);

        const element = document.createElement(tagName) as InvalidateResourceElement;
        document.body.appendChild(element);
        await element.updateComplete;

        await element.user.refresh();
        await waitFor(() => element.shadowRoot?.querySelector('.value')?.textContent === 'first');
        expect(loadCount).toBe(1);
        expect(hasResourceCache(['profile', 9])).toBe(true);

        currentValue = 'second';
        element.user.invalidate();
        await element.updateComplete;

        expect(element.user.state).toBe('idle');
        expect(hasResourceCache(['profile', 9])).toBe(true);
        expect(element.shadowRoot?.querySelector('.value')?.textContent).toBe('Idle');

        await element.user.refresh();
        await waitFor(() => element.shadowRoot?.querySelector('.value')?.textContent === 'second');

        expect(loadCount).toBe(2);
        expect(element.user.value).toBe('second');
    });

    it('can keep stale data visible while revalidating', async () => {
        const tagName = 'miura-resource-stale-while-revalidate';
        let resolveNext!: (value: string) => void;

        class StaleWhileRevalidateElement extends MiuraElement {
            user!: Resource<string>;
            private values = ['first', 'second'];

            constructor() {
                super();
                this.user = this.$resource(() => new Promise<string>((resolve) => {
                    const next = this.values.shift() ?? 'done';
                    resolveNext = () => resolve(next);
                }), { auto: false, staleWhileRevalidate: true });
            }

            protected override template() {
                return html`
                    <p class="state">${this.user.state}</p>
                    <p class="refreshing">${String(this.user.refreshing)}</p>
                    <p class="value">${this.user.value ?? 'none'}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) customElements.define(tagName, StaleWhileRevalidateElement);

        const element = document.createElement(tagName) as StaleWhileRevalidateElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const first = element.user.refresh();
        resolveNext();
        await first;
        await waitFor(() => element.shadowRoot?.querySelector('.value')?.textContent === 'first');

        const second = element.user.refresh();
        await element.updateComplete;

        expect(element.user.state).toBe('resolved');
        expect(element.user.refreshing).toBe(true);
        expect(element.shadowRoot?.querySelector('.value')?.textContent).toBe('first');

        resolveNext();
        await second;
        await waitFor(() => element.shadowRoot?.querySelector('.value')?.textContent === 'second');

        expect(element.user.refreshing).toBe(false);
        expect(element.user.value).toBe('second');
    });
});
