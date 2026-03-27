import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MiuraElement } from '../miura-element';
import { html } from '../../template/html';

describe.skip('MiuraElement', () => {
    // Setup cleanup
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    // Basic Component Creation
    describe('Component Creation', () => {
        class TestElement extends MiuraElement {
            static override template = html`<div>Hello World</div>`;
        }
        customElements.define('test-element', TestElement);

        it('should create and render basic template', async () => {
            const element = document.createElement('test-element') as TestElement;
            document.body.appendChild(element);

            await element.updateComplete;

            expect(element.shadowRoot?.innerHTML).toContain('Hello World');
        });
    });

    // Property Binding Tests
    describe('Property Bindings', () => {
        class BindingElement extends MiuraElement {
            static properties = {
                name: { type: String }
            };

            name = 'World';

            static override template = html`
        <div id="content">Hello ${p => p.name}</div>
        <input id="input" value=${p => p.name}>
      `;
        }
        customElements.define('binding-element', BindingElement);

        it('should update view when property changes', async () => {
            const element = document.createElement('binding-element') as BindingElement;
            document.body.appendChild(element);

            await element.updateComplete;

            const content = element.shadowRoot?.querySelector('#content');
            expect(content?.textContent).toBe('Hello World');

            element.name = 'Test';
            await element.updateComplete;

            expect(content?.textContent).toBe('Hello Test');
        });

        it('should update property when input changes (two-way binding)', async () => {
            const element = document.createElement('binding-element') as BindingElement;
            document.body.appendChild(element);

            await element.updateComplete;

            const input = element.shadowRoot?.querySelector('#input') as HTMLInputElement;
            input.value = 'Changed';
            input.dispatchEvent(new Event('input'));

            await element.updateComplete;

            expect(element.name).toBe('Changed');
            expect(element.shadowRoot?.querySelector('#content')?.textContent)
                .toBe('Hello Changed');
        });
    });

    // Event Handling Tests
    describe('Event Handling', () => {
        class EventElement extends MiuraElement {
            static properties = {
                count: { type: Number }
            };

            count = 0;

            increment() {
                this.count++;
            }

            static override template = html`
        <button id="btn" @click=${p => p.increment()}>
          Count: ${p => p.count}
        </button>
      `;
        }
        customElements.define('event-element', EventElement);

        it('should handle click events and update view', async () => {
            const element = document.createElement('event-element') as EventElement;
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

    // Nested Templates Tests
    describe('Nested Templates', () => {
        class ChildElement extends MiuraElement {
            static properties = {
                value: { type: String }
            };

            value = '';

            static override template = html`
        <div id="child">${p => p.value}</div>
      `;
        }
        customElements.define('child-element', ChildElement);

        class ParentElement extends MiuraElement {
            static properties = {
                items: { type: Array }
            };

            items = ['one', 'two', 'three'];

            static override template = html`
        <div id="parent">
          ${p => p.items.map(item => html`
            <child-element value=${item}></child-element>
          `)}
        </div>
      `;
        }
        customElements.define('parent-element', ParentElement);

        it('should render and update nested templates', async () => {
            const element = document.createElement('parent-element') as ParentElement;
            document.body.appendChild(element);

            await element.updateComplete;

            const children = element.shadowRoot?.querySelectorAll('child-element');
            expect(children?.length).toBe(3);

            const childValues = Array.from(children || []).map(
                child => child.shadowRoot?.querySelector('#child')?.textContent
            );
            expect(childValues).toEqual(['one', 'two', 'three']);

            // Test updating array
            element.items = ['four', 'five'];
            await element.updateComplete;

            const updatedChildren = element.shadowRoot?.querySelectorAll('child-element');
            expect(updatedChildren?.length).toBe(2);

            const updatedValues = Array.from(updatedChildren || []).map(
                child => child.shadowRoot?.querySelector('#child')?.textContent
            );
            expect(updatedValues).toEqual(['four', 'five']);
        });
    });

    // Lifecycle Tests
    describe('Lifecycle', () => {
        class LifecycleElement extends MiuraElement {
            static properties = {
                events: { type: Array }
            };

            events: string[] = [];

            override connectedCallback() {
                super.connectedCallback();
                this.events.push('connected');
            }

            override disconnectedCallback() {
                super.disconnectedCallback();
                this.events.push('disconnected');
            }

            override updated() {
                super.updated();
                this.events.push('updated');
            }

            override firstUpdated() {
                super.firstUpdated();
                this.events.push('firstUpdated');
            }

            override onMount() {
                super.onMount();
                this.events.push('onMount');
            }

            static override template = html`<div>Lifecycle Test</div>`;
        }
        customElements.define('lifecycle-element', LifecycleElement);

        it('should call lifecycle methods in correct order', async () => {
            const element = document.createElement('lifecycle-element') as LifecycleElement;

            // Test connection
            document.body.appendChild(element);
            await element.updateComplete;

            expect(element.events).toContain('connected');
            expect(element.events).toContain('updated');
            expect(element.events).toContain('firstUpdated');
            expect(element.events).toContain('onMount');

            // Test disconnection
            document.body.removeChild(element);
            expect(element.events).toContain('disconnected');

            // Verify order
            expect(element.events.indexOf('connected'))
                .toBeLessThan(element.events.indexOf('updated'));
            expect(element.events.indexOf('updated'))
                .toBeLessThan(element.events.indexOf('firstUpdated'));
            expect(element.events.indexOf('firstUpdated'))
                .toBeLessThan(element.events.indexOf('onMount'));
        });
    });
});
