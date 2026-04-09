import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html } from '../index.js';

const waitForMicrotask = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('MiuraElement directive reactivity integration', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('restores #if-controlled DOM and event bindings after toggling the backing property off and on', async () => {
        const tagName = 'miura-if-reactivity-regression';

        class IfReactivityElement extends MiuraElement {
            static override properties = {
                open: { type: Boolean, default: true },
                count: { type: Number, default: 0 },
            };

            declare open: boolean;
            declare count: number;

            protected override template() {
                return html`
                    <input
                        id="toggle"
                        type="checkbox"
                        .checked=${this.open}
                        @change=${(event: Event) => {
                            this.open = (event.target as HTMLInputElement).checked;
                        }}
                    >
                    <button
                        id="action"
                        #if=${this.open}
                        @click=${() => { this.count++; }}
                    >
                        Count: ${this.count}
                    </button>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, IfReactivityElement);
        }

        const element = document.createElement(tagName) as IfReactivityElement;
        document.body.appendChild(element);
        await element.updateComplete;

        let button = element.shadowRoot?.querySelector('#action') as HTMLButtonElement | null;
        expect(button?.textContent?.trim()).toBe('Count: 0');

        button?.click();
        await element.updateComplete;
        expect(element.count).toBe(1);

        const toggle = element.shadowRoot?.querySelector('#toggle') as HTMLInputElement;
        toggle.checked = false;
        toggle.dispatchEvent(new Event('change', { bubbles: true }));
        await element.updateComplete;

        expect(element.shadowRoot?.querySelector('#action')).toBeNull();

        toggle.checked = true;
        toggle.dispatchEvent(new Event('change', { bubbles: true }));
        await element.updateComplete;

        button = element.shadowRoot?.querySelector('#action') as HTMLButtonElement | null;
        expect(button?.textContent?.trim()).toBe('Count: 1');

        button?.click();
        await element.updateComplete;

        expect(element.count).toBe(2);
        expect(element.shadowRoot?.querySelector('#action')?.textContent?.trim()).toBe('Count: 2');
    });

    it('switches #if/#elseif/#else branches repeatedly without losing branch content', async () => {
        const tagName = 'miura-if-elseif-reactivity';

        class IfElseChainElement extends MiuraElement {
            static override properties = {
                primary: { type: Boolean, default: true },
                secondary: { type: Boolean, default: false },
            };

            declare primary: boolean;
            declare secondary: boolean;

            protected override template() {
                return html`
                    <div id="primary" #if=${this.primary}>Primary</div>
                    <div id="secondary" #elseif=${this.secondary}>Secondary</div>
                    <div id="fallback" #else>Fallback</div>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, IfElseChainElement);
        }

        const element = document.createElement(tagName) as IfElseChainElement;
        document.body.appendChild(element);
        await element.updateComplete;

        expect(element.shadowRoot?.textContent?.replace(/\s+/g, ' ').trim()).toContain('Primary');

        element.primary = false;
        element.secondary = true;
        await element.updateComplete;
        expect(element.shadowRoot?.querySelector('#secondary')?.textContent).toBe('Secondary');

        element.secondary = false;
        await element.updateComplete;
        expect(element.shadowRoot?.querySelector('#fallback')?.textContent).toBe('Fallback');

        element.primary = true;
        await element.updateComplete;
        expect(element.shadowRoot?.querySelector('#primary')?.textContent).toBe('Primary');
    });

    it('updates #for content from reactive property changes without losing later renders', async () => {
        const tagName = 'miura-for-reactivity-regression';

        class ForReactivityElement extends MiuraElement {
            static override properties = {
                items: { type: Array, default: ['One', 'Two', 'Three'] },
            };

            declare items: string[];

            protected override template() {
                return html`
                    <ul id="list" #for=${this.items}>
                        <template>
                            <li class="item">{{$index}}: {{$item}}</li>
                        </template>
                    </ul>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, ForReactivityElement);
        }

        const element = document.createElement(tagName) as ForReactivityElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const readItems = () =>
            Array.from(element.shadowRoot?.querySelectorAll('.item') || []).map((node) => node.textContent?.trim());

        expect(readItems()).toEqual(['0: One', '1: Two', '2: Three']);

        element.items = ['Solo'];
        await element.updateComplete;
        expect(readItems()).toEqual(['0: Solo']);

        element.items = ['Alpha', 'Beta'];
        await element.updateComplete;
        expect(readItems()).toEqual(['0: Alpha', '1: Beta']);
    });

    it('keeps only the latest #async branch when the reactive promise changes quickly', async () => {
        const tagName = 'miura-async-reactivity-regression';

        class AsyncReactivityElement extends MiuraElement {
            static override properties = {
                task: { type: Object, default: null },
            };

            declare task: Promise<unknown> | null;

            protected override template() {
                return html`
                    <div id="async-host" #async=${this.task}>
                        <template pending><p class="pending">Loading</p></template>
                        <template resolved><p class="resolved">Resolved</p></template>
                        <template rejected><p class="rejected">Rejected</p></template>
                    </div>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, AsyncReactivityElement);
        }

        let resolveFirst!: () => void;
        const first = new Promise<void>((resolve) => {
            resolveFirst = resolve;
        });
        const second = Promise.resolve();

        const element = document.createElement(tagName) as AsyncReactivityElement;
        element.task = first;
        document.body.appendChild(element);
        await element.updateComplete;

        expect(element.shadowRoot?.querySelector('.pending')?.textContent).toBe('Loading');

        element.task = second;
        await element.updateComplete;
        await waitForMicrotask();

        expect(element.shadowRoot?.querySelector('.resolved')?.textContent).toBe('Resolved');

        resolveFirst();
        await waitForMicrotask();

        expect(element.shadowRoot?.querySelector('.resolved')?.textContent).toBe('Resolved');
        expect(element.shadowRoot?.querySelector('.pending')).toBeNull();
    });
});
