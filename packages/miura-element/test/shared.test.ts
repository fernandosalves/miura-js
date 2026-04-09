import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html, clearShared, createSharedNamespace, sharedKey, type Signal } from '../index.js';

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

describe('MiuraElement $shared', () => {
    beforeEach(() => {
        clearShared();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        clearShared();
        document.body.innerHTML = '';
    });

    it('returns the same shared signal for components using the same key', async () => {
        const tagA = 'miura-shared-a';
        const tagB = 'miura-shared-b';

        class SharedA extends MiuraElement {
            counter: Signal<number>;

            constructor() {
                super();
                this.counter = this.$shared('counter', 0);
            }

            protected override template() {
                return html`<p class="value">${this.counter}</p>`;
            }
        }

        class SharedB extends MiuraElement {
            counter: Signal<number>;

            constructor() {
                super();
                this.counter = this.$shared('counter', 999);
            }

            protected override template() {
                return html`<p class="value">${this.counter}</p>`;
            }
        }

        if (!customElements.get(tagA)) customElements.define(tagA, SharedA);
        if (!customElements.get(tagB)) customElements.define(tagB, SharedB);

        const first = document.createElement(tagA) as SharedA;
        const second = document.createElement(tagB) as SharedB;
        document.body.append(first, second);

        await Promise.all([first.updateComplete, second.updateComplete]);

        expect(first.counter).toBe(second.counter);
        expect(first.shadowRoot?.querySelector('.value')?.textContent).toBe('0');
        expect(second.shadowRoot?.querySelector('.value')?.textContent).toBe('0');
    });

    it('updates every subscriber when shared state changes', async () => {
        const tagA = 'miura-shared-updates-a';
        const tagB = 'miura-shared-updates-b';

        class SharedCounter extends MiuraElement {
            counter: Signal<number>;

            constructor() {
                super();
                this.counter = this.$shared('live-counter', 1);
            }

            increment = () => {
                this.counter(this.counter() + 1);
            };

            protected override template() {
                return html`
                    <button class="inc" @click=${this.increment}>+</button>
                    <p class="value">${this.counter}</p>
                `;
            }
        }

        class SharedMirror extends MiuraElement {
            counter: Signal<number>;

            constructor() {
                super();
                this.counter = this.$shared('live-counter', 10);
            }

            protected override template() {
                return html`<p class="value">${this.counter}</p>`;
            }
        }

        if (!customElements.get(tagA)) customElements.define(tagA, SharedCounter);
        if (!customElements.get(tagB)) customElements.define(tagB, SharedMirror);

        const counter = document.createElement(tagA) as SharedCounter;
        const mirror = document.createElement(tagB) as SharedMirror;
        document.body.append(counter, mirror);

        await Promise.all([counter.updateComplete, mirror.updateComplete]);

        (counter.shadowRoot?.querySelector('.inc') as HTMLButtonElement).click();

        await waitFor(() => mirror.shadowRoot?.querySelector('.value')?.textContent === '2');

        expect(counter.shadowRoot?.querySelector('.value')?.textContent).toBe('2');
        expect(mirror.shadowRoot?.querySelector('.value')?.textContent).toBe('2');
    });

    it('can be reset between runs', async () => {
        const tagName = 'miura-shared-reset';

        class SharedReset extends MiuraElement {
            value: Signal<string>;

            constructor() {
                super();
                this.value = this.$shared('reset-key', 'first');
            }

            protected override template() {
                return html`<p class="value">${this.value}</p>`;
            }
        }

        if (!customElements.get(tagName)) customElements.define(tagName, SharedReset);

        const first = document.createElement(tagName) as SharedReset;
        document.body.appendChild(first);
        await first.updateComplete;

        first.value('changed');
        await waitFor(() => first.shadowRoot?.querySelector('.value')?.textContent === 'changed');

        clearShared();
        document.body.innerHTML = '';

        const second = document.createElement(tagName) as SharedReset;
        document.body.appendChild(second);
        await second.updateComplete;

        expect(second.shadowRoot?.querySelector('.value')?.textContent).toBe('first');
    });

    it('supports array keys and sharedKey helpers for namespacing', async () => {
        const tagA = 'miura-shared-array-a';
        const tagB = 'miura-shared-array-b';

        class SharedArrayA extends MiuraElement {
            value: Signal<string>;

            constructor() {
                super();
                this.value = this.$shared(['blog-editor', 'draft'], 'alpha');
            }

            protected override template() {
                return html`<p class="value">${this.value}</p>`;
            }
        }

        class SharedArrayB extends MiuraElement {
            value: Signal<string>;

            constructor() {
                super();
                this.value = this.$shared(sharedKey('blog-editor', 'draft'), 'beta');
            }

            protected override template() {
                return html`<p class="value">${this.value}</p>`;
            }
        }

        if (!customElements.get(tagA)) customElements.define(tagA, SharedArrayA);
        if (!customElements.get(tagB)) customElements.define(tagB, SharedArrayB);

        const first = document.createElement(tagA) as SharedArrayA;
        const second = document.createElement(tagB) as SharedArrayB;
        document.body.append(first, second);

        await Promise.all([first.updateComplete, second.updateComplete]);

        expect(first.value).toBe(second.value);
        expect(first.shadowRoot?.querySelector('.value')?.textContent).toBe('alpha');
        expect(second.shadowRoot?.querySelector('.value')?.textContent).toBe('alpha');
    });

    it('supports createSharedNamespace to avoid key collisions', async () => {
        const blogShared = createSharedNamespace('blog-editor');
        const profileShared = createSharedNamespace('profile-editor');

        const blogSignal = blogShared.use('draft', 'blog');
        const profileSignal = profileShared.use('draft', 'profile');

        expect(blogSignal).not.toBe(profileSignal);
        expect(blogSignal()).toBe('blog');
        expect(profileSignal()).toBe('profile');

        blogSignal('updated-blog');

        expect(blogShared.get<string>('draft')?.()).toBe('updated-blog');
        expect(profileShared.get<string>('draft')?.()).toBe('profile');
        expect(blogShared.has('draft')).toBe(true);
        expect(profileShared.has('draft')).toBe(true);
    });
});
