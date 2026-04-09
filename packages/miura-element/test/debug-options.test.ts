import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearDebugLayers, clearDiagnostics, clearTimelineEvents, getDebugLayers, getDiagnostics, getTimelineEvents } from '@miurajs/miura-debugger';
import { componentDebug, debug } from '../src/decorators.js';
import { MiuraElement } from '../src/miura-element.js';
import { html } from '@miurajs/miura-render';

describe('component debug options', () => {
    beforeEach(() => {
        clearDebugLayers();
        clearDiagnostics();
        clearTimelineEvents();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        clearDebugLayers();
        clearDiagnostics();
        clearTimelineEvents();
        document.body.innerHTML = '';
    });

    it('applies component-specific layer labels and colors', async () => {
        const tagName = `debug-layer-${crypto.randomUUID()}`;

        class DebugLayerElement extends MiuraElement {
            protected template() {
                return html`<p>ready</p>`;
            }
        }

        debug({
            label: 'BlogCard',
            color: '12, 145, 255',
            showRenderTime: true,
        })(DebugLayerElement);

        customElements.define(tagName, DebugLayerElement);
        const element = document.createElement(tagName) as DebugLayerElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const layer = getDebugLayers()[0];
        expect(layer?.label).toBe('BlogCard');
        expect(layer?.color).toBe('12, 145, 255');
        expect(layer?.showRenderTime).toBe(true);
    });

    it('keeps componentDebug as a compatibility alias', async () => {
        const tagName = `debug-alias-${crypto.randomUUID()}`;

        class AliasDebugElement extends MiuraElement {
            protected template() {
                return html`<p>alias</p>`;
            }
        }

        componentDebug({
            label: 'AliasLayer',
        })(AliasDebugElement);

        customElements.define(tagName, AliasDebugElement);
        const element = document.createElement(tagName) as AliasDebugElement;
        document.body.appendChild(element);
        await element.updateComplete;

        expect(getDebugLayers()[0]?.label).toBe('AliasLayer');
    });

    it('allows a component to silence its own diagnostics and layers', async () => {
        const tagName = `debug-silent-${crypto.randomUUID()}`;

        class SilentDebugElement extends MiuraElement {
            static debug = {
                report: false,
                layers: false,
            };

            protected template() {
                throw new Error('boom');
            }

            protected onError(): boolean {
                return true;
            }
        }

        customElements.define(tagName, SilentDebugElement);
        const element = document.createElement(tagName) as SilentDebugElement;
        document.body.appendChild(element);
        await element.updateComplete;

        expect(getDiagnostics()).toHaveLength(0);
        expect(getDebugLayers()).toHaveLength(0);
    });

    it('captures resources and forms in the debug layer snapshot', async () => {
        const tagName = `debug-panels-${crypto.randomUUID()}`;

        class DebugPanelsElement extends MiuraElement {
            data = this.$resource(async () => ({ title: 'Hello world' }), { auto: false, key: ['post', 1] });
            form = this.$form({ title: '', published: false });

            protected template() {
                return html`<p>${this.form.values.title}</p>`;
            }
        }

        customElements.define(tagName, DebugPanelsElement);
        const element = document.createElement(tagName) as DebugPanelsElement;
        document.body.appendChild(element);

        element.form.set('title', 'Draft');
        element.data.hydrate({ title: 'Hello world' });
        await element.updateComplete;

        const layer = getDebugLayers()[0];
        expect(layer?.resources).toHaveLength(1);
        expect(layer?.resources?.[0]?.state).toBe('resolved');
        expect(layer?.forms).toHaveLength(1);
        expect(layer?.forms?.[0]?.values).toMatchObject({ title: 'Draft', published: false });
    });

    it('emits timeline events for resource and form activity', async () => {
        const tagName = `debug-timeline-${crypto.randomUUID()}`;

        class DebugTimelineElement extends MiuraElement {
            data = this.$resource(async () => ({ ok: true }), { auto: false });
            form = this.$form(
                { title: '' },
                {
                    validateAsync: async (values) => ({
                        title: values.title ? undefined : 'Required',
                    }),
                },
            );

            protected template() {
                return html`<p>${this.form.values.title}</p>`;
            }
        }

        customElements.define(tagName, DebugTimelineElement);
        const element = document.createElement(tagName) as DebugTimelineElement;
        document.body.appendChild(element);

        await element.data.refresh();
        await element.form.validateAsync();
        element.form.set('title', 'Published');
        await element.form.submit(async (values) => values.title);

        const messages = getTimelineEvents().map((entry) => entry.message);
        expect(messages).toContain('Resource refresh started');
        expect(messages).toContain('Resource refresh resolved');
        expect(messages).toContain('Async form validation started');
        expect(messages).toContain('Form submit started');
        expect(messages).toContain('Form submit resolved');
    });
});
