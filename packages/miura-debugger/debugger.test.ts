import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    clearDebugLayers,
    clearDiagnostics,
    clearTimelineEvents,
    enableMiuraDebugger,
    getDebugLayers,
    getDiagnostics,
    getTimelineEvents,
    registerDebugLayer,
    reportDiagnostic,
    reportTimelineEvent,
    unmountMiuraDevOverlay,
} from './index.js';

describe('miura debugger runtime', () => {
    beforeEach(() => {
        clearDiagnostics();
        clearDebugLayers();
        clearTimelineEvents();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        clearDiagnostics();
        clearDebugLayers();
        clearTimelineEvents();
        unmountMiuraDevOverlay();
        document.body.innerHTML = '';
    });

    it('mounts a dev overlay and stores diagnostics', async () => {
        enableMiuraDebugger({ overlay: true, layers: false, performance: false });

        reportDiagnostic({
            subsystem: 'element',
            stage: 'update',
            severity: 'error',
            message: 'Failed to update blog-card',
            bindingLabel: 'text expression for post.title',
        });

        const overlay = document.querySelector('miura-dev-overlay');
        expect(overlay).not.toBeNull();
        expect(getDiagnostics()[0]?.bindingLabel).toBe('text expression for post.title');
    });

    it('tracks component layers for the overlay', () => {
        enableMiuraDebugger({ overlay: false, layers: true, performance: true });

        const element = document.createElement('div');
        document.body.appendChild(element);

        registerDebugLayer({
            id: 'blog-card-1',
            label: 'blog-card',
            element,
            status: 'updated',
            renderTime: 2.4,
            updateCount: 3,
        });

        expect(getDebugLayers()).toHaveLength(1);
        expect(getDebugLayers()[0]?.label).toBe('blog-card');
        expect(getDebugLayers()[0]?.renderTime).toBe(2.4);
    });

    it('highlights the element associated with the active diagnostic', () => {
        enableMiuraDebugger({ overlay: true, layers: false, performance: false });

        const element = document.createElement('div');
        document.body.appendChild(element);
        Object.defineProperty(element, 'getBoundingClientRect', {
            configurable: true,
            value: () => ({
                left: 20,
                top: 30,
                width: 140,
                height: 60,
                right: 160,
                bottom: 90,
                x: 20,
                y: 30,
                toJSON: () => ({}),
            }),
        });

        reportDiagnostic({
            subsystem: 'element',
            stage: 'update',
            severity: 'error',
            message: 'Failed to update blog-card',
            componentTag: 'blog-card',
            element,
        });

        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const focusBox = overlay?.shadowRoot?.querySelector('.focus-box') as HTMLElement | null;
        expect(focusBox).not.toBeNull();
        expect(focusBox?.style.left).toBe('20px');
        expect(focusBox?.style.top).toBe('30px');
    });

    it('stores timeline events and shows them in the overlay', () => {
        enableMiuraDebugger({ overlay: true, layers: false, performance: false });

        const element = document.createElement('div');
        document.body.appendChild(element);

        reportDiagnostic({
            subsystem: 'element',
            stage: 'update',
            severity: 'error',
            message: 'Failed to update blog-card',
            componentTag: 'blog-card',
            element,
        });

        reportTimelineEvent({
            subsystem: 'element',
            stage: 'render',
            message: 'Render completed for blog-card',
            element,
        });

        expect(getTimelineEvents()).toHaveLength(1);
        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const bodyText = overlay?.shadowRoot?.querySelector('.body')?.textContent ?? '';
        expect(bodyText).toContain('Timeline');
        expect(bodyText).toContain('Render completed for blog-card');
    });

    it('renders click-through layer highlights so the story remains interactive', () => {
        enableMiuraDebugger({ overlay: true, layers: true, performance: true });

        const element = document.createElement('div');
        document.body.appendChild(element);
        Object.defineProperty(element, 'getBoundingClientRect', {
            configurable: true,
            value: () => ({
                left: 10,
                top: 12,
                width: 120,
                height: 48,
                right: 130,
                bottom: 60,
                x: 10,
                y: 12,
                toJSON: () => ({}),
            }),
        });

        registerDebugLayer({
            id: 'blog-editor-1',
            label: 'BlogEditor',
            element,
            status: 'updated',
            componentTag: 'blog-editor',
            renderTime: 1.8,
            updateCount: 2,
            valuesSnapshot: { title: 'Hello', open: true },
            resources: [{ label: 'post', state: 'resolved' }],
            forms: [{ label: 'editor', values: { title: 'Hello' } }],
            metrics: { updateCount: 2 },
        });

        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const layerBox = overlay?.shadowRoot?.querySelector('.layer-box') as HTMLElement | null;
        expect(layerBox).not.toBeNull();

        layerBox?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

        const panel = overlay?.shadowRoot?.querySelector('.panel') as HTMLElement | null;
        expect(panel?.classList.contains('hidden')).toBe(true);
    });
});
