import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html } from '../index.js';

describe('MiuraElement legacy coverage (modernized)', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Component Creation', () => {
        const tagName = 'miura-test-basic';

        class TestElement extends MiuraElement {
            protected override template() {
                return html`<div>Hello World</div>`;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, TestElement);
        }

        it('should create and render a basic template', async () => {
            const element = document.createElement(tagName) as TestElement;
            document.body.appendChild(element);

            await element.updateComplete;

            expect(element.shadowRoot?.textContent).toContain('Hello World');
        });
    });

    describe('Property Bindings', () => {
        const tagName = 'miura-binding-element';

        class BindingElement extends MiuraElement {
            static override properties = {
                name: { type: String, default: 'World' }
            };

            declare name: string;

            protected override template() {
                return html`
                    <div id="content">Hello ${this.name}</div>
                    <input
                        id="input"
                        .value=${this.name}
                        @input=${(event: Event) => {
                            this.name = (event.target as HTMLInputElement).value;
                        }}
                    >
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, BindingElement);
        }

        it('should update view when property changes', async () => {
            const element = document.createElement(tagName) as BindingElement;
            document.body.appendChild(element);

            await element.updateComplete;

            const content = element.shadowRoot?.querySelector('#content');
            expect(content?.textContent).toBe('Hello World');

            element.name = 'Test';
            await element.updateComplete;

            expect(content?.textContent).toBe('Hello Test');
        });

        it('should update property when input changes', async () => {
            const element = document.createElement(tagName) as BindingElement;
            document.body.appendChild(element);

            await element.updateComplete;

            const input = element.shadowRoot?.querySelector('#input') as HTMLInputElement;
            input.value = 'Changed';
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

            await element.updateComplete;

            expect(element.name).toBe('Changed');
            expect(element.shadowRoot?.querySelector('#content')?.textContent).toBe('Hello Changed');
        });
    });

    describe('Event Handling', () => {
        const tagName = 'miura-event-element';

        class EventElement extends MiuraElement {
            static override properties = {
                count: { type: Number, default: 0 }
            };

            declare count: number;

            increment() {
                this.count++;
            }

            protected override template() {
                return html`
                    <button id="btn" @click=${() => this.increment()}>
                        Count: ${this.count}
                    </button>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, EventElement);
        }

        it('should handle click events and update view', async () => {
            const element = document.createElement(tagName) as EventElement;
            document.body.appendChild(element);

            await element.updateComplete;

            const button = element.shadowRoot?.querySelector('#btn') as HTMLButtonElement;
            expect(button.textContent?.trim()).toBe('Count: 0');

            button.click();
            await element.updateComplete;

            expect(button.textContent?.trim()).toBe('Count: 1');
            expect(element.count).toBe(1);
        });
    });

    describe('Nested Templates', () => {
        const childTag = 'miura-child-element';
        const parentTag = 'miura-parent-element';

        class ChildElement extends MiuraElement {
            static override properties = {
                value: { type: String, default: '' }
            };

            declare value: string;

            protected override template() {
                return html`<div id="child">${this.value}</div>`;
            }
        }

        class ParentElement extends MiuraElement {
            static override properties = {
                items: { type: Array, default: ['one', 'two', 'three'] }
            };

            declare items: string[];

            protected override template() {
                return html`
                    <div id="parent">
                        ${this.items.map(item => html`
                            <miura-child-element value=${item}></miura-child-element>
                        `)}
                    </div>
                `;
            }
        }

        if (!customElements.get(childTag)) {
            customElements.define(childTag, ChildElement);
        }

        if (!customElements.get(parentTag)) {
            customElements.define(parentTag, ParentElement);
        }

        it('should render and update nested templates', async () => {
            const element = document.createElement(parentTag) as ParentElement;
            document.body.appendChild(element);

            await element.updateComplete;

            const children = element.shadowRoot?.querySelectorAll(childTag);
            expect(children?.length).toBe(3);
            await Promise.all(Array.from(children || []).map((child) => (child as ChildElement).updateComplete));

            const childValues = Array.from(children || []).map(
                child => (child as ChildElement).shadowRoot?.querySelector('#child')?.textContent
            );
            expect(childValues).toEqual(['one', 'two', 'three']);

            element.items = ['four', 'five'];
            await element.updateComplete;

            const updatedChildren = element.shadowRoot?.querySelectorAll(childTag);
            expect(updatedChildren?.length).toBe(2);
            await Promise.all(Array.from(updatedChildren || []).map((child) => (child as ChildElement).updateComplete));

            const updatedValues = Array.from(updatedChildren || []).map(
                child => (child as ChildElement).shadowRoot?.querySelector('#child')?.textContent
            );
            expect(updatedValues).toEqual(['four', 'five']);
        });
    });

    describe('Lifecycle', () => {
        const tagName = 'miura-lifecycle-element';

        class LifecycleElement extends MiuraElement {
            events: string[] = [];

            override connectedCallback() {
                super.connectedCallback();
                this.events.push('connected');
            }

            override disconnectedCallback() {
                super.disconnectedCallback();
                this.events.push('disconnected');
            }

            protected override updated() {
                this.events.push('updated');
            }

            protected override firstUpdated() {
                this.events.push('firstUpdated');
            }

            protected override onMount() {
                this.events.push('onMount');
            }

            protected override template() {
                return html`<div>Lifecycle Test</div>`;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, LifecycleElement);
        }

        it('should call lifecycle methods in the current order', async () => {
            const element = document.createElement(tagName) as LifecycleElement;

            document.body.appendChild(element);
            await element.updateComplete;

            expect(element.events).toContain('connected');
            expect(element.events).toContain('updated');
            expect(element.events).toContain('firstUpdated');
            expect(element.events).toContain('onMount');

            document.body.removeChild(element);
            expect(element.events).toContain('disconnected');

            expect(element.events.indexOf('connected')).toBeLessThan(element.events.indexOf('updated'));
            expect(element.events.indexOf('updated')).toBeLessThan(element.events.indexOf('firstUpdated'));
            expect(element.events.indexOf('firstUpdated')).toBeLessThan(element.events.indexOf('onMount'));
        });
    });
});
