import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html, type Resource } from '../index.js';

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
    });

    afterEach(() => {
        document.body.innerHTML = '';
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
});
