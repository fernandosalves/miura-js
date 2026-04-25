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

    it('shows a runtime panel when only timeline events exist', () => {
        enableMiuraDebugger({ overlay: true, layers: false, performance: false, openOnTimeline: true });

        reportTimelineEvent({
            subsystem: 'router',
            stage: 'navigation',
            message: 'Navigation completed for /settings',
            routePath: '/settings',
        });

        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const panel = overlay?.shadowRoot?.querySelector('.panel') as HTMLElement | null;
        const bodyText = overlay?.shadowRoot?.querySelector('.body')?.textContent ?? '';

        expect(panel?.classList.contains('hidden')).toBe(false);
        expect(bodyText).toContain('Miura debugger timeline');
        expect(bodyText).toContain('Navigation completed for /settings');
    });

    it('keeps the panel closed for timeline-only events when openOnTimeline is disabled', () => {
        enableMiuraDebugger({ overlay: true, layers: false, performance: false, openOnTimeline: false });

        reportTimelineEvent({
            subsystem: 'router',
            stage: 'navigation',
            message: 'Navigation completed for /settings',
            routePath: '/settings',
        });

        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const panel = overlay?.shadowRoot?.querySelector('.panel') as HTMLElement | null;

        expect(panel?.classList.contains('hidden')).toBe(true);
    });

    it('reopens the panel when a new timeline event arrives after dismiss', () => {
        enableMiuraDebugger({ overlay: true, layers: false, performance: false, openOnTimeline: true });

        reportTimelineEvent({
            subsystem: 'router',
            stage: 'navigation',
            message: 'Navigation completed for /settings',
            routePath: '/settings',
        });

        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const panel = overlay?.shadowRoot?.querySelector('.panel') as HTMLElement | null;
        const closeButton = overlay?.shadowRoot?.querySelector('[data-action="close"]') as HTMLButtonElement | null;

        expect(panel?.classList.contains('hidden')).toBe(false);

        closeButton?.click();
        expect(panel?.classList.contains('hidden')).toBe(true);

        reportTimelineEvent({
            subsystem: 'element',
            stage: 'render',
            message: 'Render completed for blog-card',
        });

        expect(panel?.classList.contains('hidden')).toBe(false);
    });

    it('reopens the panel when a new error arrives after dismiss', () => {
        enableMiuraDebugger({ overlay: true, layers: false, performance: false, openOnError: true });

        reportDiagnostic({
            subsystem: 'element',
            stage: 'update',
            severity: 'error',
            message: 'Failed to update blog-card',
        });

        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const panel = overlay?.shadowRoot?.querySelector('.panel') as HTMLElement | null;
        const closeButton = overlay?.shadowRoot?.querySelector('[data-action="close"]') as HTMLButtonElement | null;

        expect(panel?.classList.contains('hidden')).toBe(false);

        closeButton?.click();
        expect(panel?.classList.contains('hidden')).toBe(true);

        reportDiagnostic({
            subsystem: 'element',
            stage: 'update',
            severity: 'error',
            message: 'Another render failure',
        });

        expect(panel?.classList.contains('hidden')).toBe(false);
    });

    it('keeps the panel closed for warnings unless openOnWarning is enabled', () => {
        enableMiuraDebugger({ overlay: true, layers: false, performance: false, openOnError: true });

        reportDiagnostic({
            subsystem: 'element',
            stage: 'binding',
            severity: 'warning',
            message: 'Skipped fine-grained promotion for ambiguous direct read "label".',
        });

        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const panel = overlay?.shadowRoot?.querySelector('.panel') as HTMLElement | null;

        expect(panel?.classList.contains('hidden')).toBe(true);
    });

    it('can open the panel for warnings when configured', () => {
        enableMiuraDebugger({ overlay: true, layers: false, performance: false, openOnWarning: true });

        reportDiagnostic({
            subsystem: 'element',
            stage: 'binding',
            severity: 'warning',
            message: 'Skipped fine-grained promotion for ambiguous direct read "label".',
        });

        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const panel = overlay?.shadowRoot?.querySelector('.panel') as HTMLElement | null;

        expect(panel?.classList.contains('hidden')).toBe(false);
    });

    it('does not start dragging when clicking a header control button', () => {
        enableMiuraDebugger({ overlay: true, layers: false, performance: false, openOnError: true });

        reportDiagnostic({
            subsystem: 'element',
            stage: 'update',
            severity: 'error',
            message: 'Failed to update blog-card',
        });

        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const panel = overlay?.shadowRoot?.querySelector('.panel') as HTMLElement | null;
        const closeButton = overlay?.shadowRoot?.querySelector('[data-action="close"]') as HTMLButtonElement | null;

        expect(panel?.classList.contains('hidden')).toBe(false);

        const pointerDown = new Event('pointerdown', { bubbles: true, composed: true }) as Event & { pointerId: number };
        pointerDown.pointerId = 1;
        const pointerUp = new Event('pointerup', { bubbles: true, composed: true }) as Event & { pointerId: number };
        pointerUp.pointerId = 1;

        closeButton?.dispatchEvent(pointerDown);
        closeButton?.dispatchEvent(pointerUp);
        closeButton?.click();

        expect(panel?.classList.contains('hidden')).toBe(true);
    });

    it('removes visual overlays when the panel is closed', () => {
        enableMiuraDebugger({ overlay: true, layers: true, performance: true, openOnError: true });

        const element = document.createElement('div');
        document.body.appendChild(element);
        Object.defineProperty(element, 'getBoundingClientRect', {
            configurable: true,
            value: () => ({
                left: 16,
                top: 24,
                width: 100,
                height: 40,
                right: 116,
                bottom: 64,
                x: 16,
                y: 24,
                toJSON: () => ({}),
            }),
        });

        registerDebugLayer({
            id: 'overlay-demo-1',
            label: 'OverlayDemo',
            element,
            status: 'error',
            componentTag: 'overlay-demo',
            renderTime: 1.2,
            updateCount: 1,
        });

        reportDiagnostic({
            subsystem: 'element',
            stage: 'update',
            severity: 'error',
            message: 'Failed to update overlay-demo',
            componentTag: 'overlay-demo',
            element,
        });

        const overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
        const panel = overlay?.shadowRoot?.querySelector('.panel') as HTMLElement | null;
        const layerRoot = overlay?.shadowRoot?.querySelector('.layer-root') as HTMLElement | null;
        const focusRoot = overlay?.shadowRoot?.querySelector('.focus-root') as HTMLElement | null;
        const closeButton = overlay?.shadowRoot?.querySelector('[data-action="close"]') as HTMLButtonElement | null;

        expect(panel?.classList.contains('hidden')).toBe(false);
        expect(layerRoot?.innerHTML).toContain('layer-box');
        expect(focusRoot?.innerHTML).toContain('focus-box');

        closeButton?.click();

        expect(panel?.classList.contains('hidden')).toBe(true);
        expect(layerRoot?.innerHTML).toBe('');
        expect(focusRoot?.innerHTML).toBe('');
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
