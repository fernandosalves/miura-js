import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, createContextKey, createSignal, html, type Signal } from '../index.js';

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

const THEME = createContextKey<string>('theme');
const THEME_SIGNAL = createContextKey<Signal<string>>('theme-signal');

describe('MiuraElement context', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('injects the nearest provided value from an ancestor component', async () => {
        const providerTag = 'miura-context-provider-basic';
        const consumerTag = 'miura-context-consumer-basic';

        class ContextConsumer extends MiuraElement {
            protected override template() {
                const theme = this.$inject(THEME, 'fallback');
                return html`<p class="theme">${theme}</p>`;
            }
        }

        class ContextProvider extends MiuraElement {
            constructor() {
                super();
                this.$provide(THEME, 'ocean');
            }

            protected override template() {
                return html`<miura-context-consumer-basic></miura-context-consumer-basic>`;
            }
        }

        if (!customElements.get(consumerTag)) customElements.define(consumerTag, ContextConsumer);
        if (!customElements.get(providerTag)) customElements.define(providerTag, ContextProvider);

        const provider = document.createElement(providerTag) as ContextProvider;
        document.body.appendChild(provider);
        await provider.updateComplete;

        const consumer = provider.shadowRoot?.querySelector(consumerTag) as ContextConsumer;
        await consumer.updateComplete;

        expect(consumer.shadowRoot?.querySelector('.theme')?.textContent).toBe('ocean');
    });

    it('prefers the nearest provider when contexts are nested', async () => {
        const outerTag = 'miura-context-provider-outer';
        const innerTag = 'miura-context-provider-inner';
        const consumerTag = 'miura-context-consumer-nearest';

        class ContextConsumer extends MiuraElement {
            protected override template() {
                return html`<p class="theme">${this.$inject(THEME, 'fallback')}</p>`;
            }
        }

        class InnerProvider extends MiuraElement {
            constructor() {
                super();
                this.$provide(THEME, 'inner');
            }

            protected override template() {
                return html`<miura-context-consumer-nearest></miura-context-consumer-nearest>`;
            }
        }

        class OuterProvider extends MiuraElement {
            constructor() {
                super();
                this.$provide(THEME, 'outer');
            }

            protected override template() {
                return html`<miura-context-provider-inner></miura-context-provider-inner>`;
            }
        }

        if (!customElements.get(consumerTag)) customElements.define(consumerTag, ContextConsumer);
        if (!customElements.get(innerTag)) customElements.define(innerTag, InnerProvider);
        if (!customElements.get(outerTag)) customElements.define(outerTag, OuterProvider);

        const outer = document.createElement(outerTag) as OuterProvider;
        document.body.appendChild(outer);
        await outer.updateComplete;

        const inner = outer.shadowRoot?.querySelector(innerTag) as InnerProvider;
        await inner.updateComplete;

        const consumer = inner.shadowRoot?.querySelector(consumerTag) as ContextConsumer;
        await consumer.updateComplete;

        expect(consumer.shadowRoot?.querySelector('.theme')?.textContent).toBe('inner');
    });

    it('uses the fallback when no provider is found', async () => {
        const consumerTag = 'miura-context-consumer-fallback';

        class ContextConsumer extends MiuraElement {
            protected override template() {
                return html`<p class="theme">${this.$inject(THEME, 'fallback')}</p>`;
            }
        }

        if (!customElements.get(consumerTag)) customElements.define(consumerTag, ContextConsumer);

        const consumer = document.createElement(consumerTag) as ContextConsumer;
        document.body.appendChild(consumer);
        await consumer.updateComplete;

        expect(consumer.shadowRoot?.querySelector('.theme')?.textContent).toBe('fallback');
    });

    it('stays reactive when a provider exposes a signal as context', async () => {
        const providerTag = 'miura-context-provider-signal';
        const consumerTag = 'miura-context-consumer-signal';

        class SignalConsumer extends MiuraElement {
            protected override template() {
                const theme = this.$inject(THEME_SIGNAL, createSignal('fallback'))!;
                return html`<p class="theme">${theme}</p>`;
            }
        }

        class SignalProvider extends MiuraElement {
            theme: Signal<string>;

            constructor() {
                super();
                this.theme = this.$signal('light');
                this.$provide(THEME_SIGNAL, this.theme);
            }

            toggle = () => {
                this.theme(this.theme() === 'light' ? 'dark' : 'light');
            };

            protected override template() {
                return html`
                    <button class="toggle" @click=${this.toggle}>Toggle</button>
                    <miura-context-consumer-signal></miura-context-consumer-signal>
                `;
            }
        }

        if (!customElements.get(consumerTag)) customElements.define(consumerTag, SignalConsumer);
        if (!customElements.get(providerTag)) customElements.define(providerTag, SignalProvider);

        const provider = document.createElement(providerTag) as SignalProvider;
        document.body.appendChild(provider);
        await provider.updateComplete;

        const consumer = provider.shadowRoot?.querySelector(consumerTag) as SignalConsumer;
        await consumer.updateComplete;

        expect(consumer.shadowRoot?.querySelector('.theme')?.textContent).toBe('light');

        (provider.shadowRoot?.querySelector('.toggle') as HTMLButtonElement).click();

        await waitFor(() => consumer.shadowRoot?.querySelector('.theme')?.textContent === 'dark');

        expect(consumer.shadowRoot?.querySelector('.theme')?.textContent).toBe('dark');
    });
});
