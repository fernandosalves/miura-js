import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MiuraElement, beacon, global, html, pulse } from '../index.js';
import { signal } from '../src/decorators.js';

describe('state primitives foundations', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('@global shares retained state across component instances', async () => {
        const tagName = `global-field-${crypto.randomUUID()}`;

        class GlobalFieldElement extends MiuraElement {
            @global({ key: ['app', 'theme'], initial: 'light' })
            theme!: string;

            protected override template() {
                return html`<p class="theme">${this.theme}</p>`;
            }
        }

        customElements.define(tagName, GlobalFieldElement);

        const first = document.createElement(tagName) as GlobalFieldElement;
        const second = document.createElement(tagName) as GlobalFieldElement;
        document.body.append(first, second);

        await Promise.all([first.updateComplete, second.updateComplete]);
        expect(first.theme).toBe('light');
        expect(second.theme).toBe('light');

        first.theme = 'dark';
        await Promise.all([first.updateComplete, second.updateComplete]);

        expect(second.theme).toBe('dark');
        expect(first.shadowRoot?.querySelector('.theme')?.textContent).toBe('dark');
        expect(second.shadowRoot?.querySelector('.theme')?.textContent).toBe('dark');
    });

    it('@beacon resolves a shared payload channel on component instances', () => {
        const tagName = `beacon-field-${crypto.randomUUID()}`;
        const seen: string[] = [];

        class BeaconElement extends MiuraElement {
            @beacon<string>({ key: 'app:message' })
            declare messageBus: { emit(value: string): void; on(listener: (value: string) => void): () => void };
        }

        customElements.define(tagName, BeaconElement);
        const first = document.createElement(tagName) as BeaconElement;
        const second = document.createElement(tagName) as BeaconElement;

        const off = second.messageBus.on((value) => seen.push(value));
        first.messageBus.emit('hello');
        off();

        expect(seen).toEqual(['hello']);
        expect(first.messageBus).toBe(second.messageBus);
    });

    it('@pulse resolves a shared void channel on component instances', () => {
        const tagName = `pulse-field-${crypto.randomUUID()}`;

        class PulseElement extends MiuraElement {
            @pulse({ key: 'app:refresh' })
            declare refresh: { emit(): void; on(listener: () => void): () => void };
        }

        customElements.define(tagName, PulseElement);
        const first = document.createElement(tagName) as PulseElement;
        const second = document.createElement(tagName) as PulseElement;
        const listener = vi.fn();

        const off = second.refresh.on(listener);
        first.refresh.emit();
        off();

        expect(listener).toHaveBeenCalledTimes(1);
        expect(first.refresh).toBe(second.refresh);
    });

    it('@signal exposes plain property syntax with direct backing signal access', async () => {
        const tagName = `signal-field-${crypto.randomUUID()}`;

        class SignalElement extends MiuraElement {
            @signal({ default: 0 })
            count!: number;

            updateCalls = 0;

            protected override updated(): void {
                this.updateCalls++;
            }

            increment() {
                this.count += 1;
            }

            protected override template() {
                return html`<p class="count">${this.$ref<number>('count')}</p>`;
            }
        }

        customElements.define(tagName, SignalElement);
        const element = document.createElement(tagName) as SignalElement;
        document.body.appendChild(element);

        await element.updateComplete;
        expect(element.count).toBe(0);
        expect(element.shadowRoot?.querySelector('.count')?.textContent).toBe('0');
        expect(element.updateCalls).toBe(1);

        element.increment();
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(element.count).toBe(1);
        expect(element.shadowRoot?.querySelector('.count')?.textContent).toBe('1');
        expect(element.updateCalls).toBe(1);
    });

    it('$globalRef exposes the fine-grained backing signal for @global fields', async () => {
        const tagName = `global-ref-${crypto.randomUUID()}`;

        class GlobalRefElement extends MiuraElement {
            @global({ key: 'app:counter', initial: 1 })
            counter!: number;

            protected override template() {
                return html`<p class="counter">${this.$globalRef<number>('counter')}</p>`;
            }
        }

        customElements.define(tagName, GlobalRefElement);

        const first = document.createElement(tagName) as GlobalRefElement;
        const second = document.createElement(tagName) as GlobalRefElement;
        document.body.append(first, second);

        await Promise.all([first.updateComplete, second.updateComplete]);
        expect(first.shadowRoot?.querySelector('.counter')?.textContent).toBe('1');
        expect(second.shadowRoot?.querySelector('.counter')?.textContent).toBe('1');

        first.counter = 2;
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(second.counter).toBe(2);
        expect(first.shadowRoot?.querySelector('.counter')?.textContent).toBe('2');
        expect(second.shadowRoot?.querySelector('.counter')?.textContent).toBe('2');
    });

    it('exposes signal-backed fields through the $ proxy', async () => {
        const tagName = `signal-proxy-${crypto.randomUUID()}`;

        class SignalProxyElement extends MiuraElement {
            @signal({ default: 1 })
            count!: number;

            @global({ key: 'app:proxy-theme', initial: 'light' })
            theme!: string;

            protected override template() {
                return html`
          <p class="count">${this.$.count}</p>
          <p class="theme">${this.$.theme}</p>
        `;
            }
        }

        customElements.define(tagName, SignalProxyElement);
        const first = document.createElement(tagName) as SignalProxyElement;
        const second = document.createElement(tagName) as SignalProxyElement;
        document.body.append(first, second);

        await Promise.all([first.updateComplete, second.updateComplete]);
        expect(first.shadowRoot?.querySelector('.count')?.textContent).toBe('1');
        expect(first.shadowRoot?.querySelector('.theme')?.textContent).toBe('light');

        first.count = 3;
        first.theme = 'dark';
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(first.shadowRoot?.querySelector('.count')?.textContent).toBe('3');
        expect(first.shadowRoot?.querySelector('.theme')?.textContent).toBe('dark');
        expect(second.shadowRoot?.querySelector('.theme')?.textContent).toBe('dark');
    });

    it('keeps field refs stable and supports mapped fine-grained bindings', async () => {
        const tagName = `field-ref-${crypto.randomUUID()}`;

        class FieldRefElement extends MiuraElement {
            @signal({ default: 2 })
            count!: number;

            protected override template() {
                return html`
                    <p class="count">${this.$.count}</p>
                    <p class="double">${(this.$.count as any).map((value: number) => value * 2)}</p>
        `;
            }
        }

        customElements.define(tagName, FieldRefElement);
        const element = document.createElement(tagName) as FieldRefElement;
        document.body.appendChild(element);

        await element.updateComplete;

        const firstRef = (element as any).$.count;
        const secondRef = (element as any).$.count;
        expect(firstRef).toBe(secondRef);
        expect(firstRef.value).toBe(2);
        expect(`${firstRef}`).toBe('2');
        expect(element.shadowRoot?.querySelector('.double')?.textContent).toBe('4');

        element.count = 5;
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(firstRef.value).toBe(5);
        expect(element.shadowRoot?.querySelector('.count')?.textContent).toBe('5');
        expect(element.shadowRoot?.querySelector('.double')?.textContent).toBe('10');
    });

    it('cleans up $on subscriptions on disconnect', () => {
        const tagName = `beacon-listener-${crypto.randomUUID()}`;
        const seen: string[] = [];

        class BeaconListenerElement extends MiuraElement {
            @beacon<string>({ key: 'app:events' })
            declare events: { emit(value: string): void; on(listener: (value: string) => void): () => void };

            connectedCallback(): void {
                super.connectedCallback();
                this.$on(this.events, (value) => seen.push(value));
            }

            protected override template() {
                return html`<div></div>`;
            }
        }

        customElements.define(tagName, BeaconListenerElement);
        const element = document.createElement(tagName) as BeaconListenerElement;
        document.body.appendChild(element);

        element.events.emit('first');
        document.body.removeChild(element);
        element.events.emit('second');

        expect(seen).toEqual(['first']);
    });

    it('supports $once for pulse channels', () => {
        const tagName = `pulse-once-${crypto.randomUUID()}`;
        const listener = vi.fn();

        class PulseOnceElement extends MiuraElement {
            @pulse({ key: 'app:pulse-once' })
            declare refresh: { emit(): void; once(listener: () => void): () => void };

            connectedCallback(): void {
                super.connectedCallback();
                this.$once(this.refresh, listener);
            }

            protected override template() {
                return html`<div></div>`;
            }
        }

        customElements.define(tagName, PulseOnceElement);
        const element = document.createElement(tagName) as PulseOnceElement;
        document.body.appendChild(element);

        element.refresh.emit();
        element.refresh.emit();

        expect(listener).toHaveBeenCalledTimes(1);
    });
});
