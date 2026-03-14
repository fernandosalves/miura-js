import { describe, it, expect, beforeEach } from 'vitest';
import {
    createIslandHTML,
    renderIslands,
    buildManifest,
    IslandRegistry,
} from '../src/server/island-renderer.js';

// ── createIslandHTML ───────────────────────────────────────────────────────────

describe('createIslandHTML()', () => {
    it('produces a <miura-island> wrapper with the component attribute', () => {
        const html = createIslandHTML({ component: 'my-counter' });
        expect(html).toContain('<miura-island component="my-counter"');
        expect(html).toContain('</miura-island>');
    });

    it('defaults hydrate to "load"', () => {
        const html = createIslandHTML({ component: 'my-counter' });
        expect(html).toContain('hydrate="load"');
    });

    it('uses the provided hydrate strategy', () => {
        const html = createIslandHTML({ component: 'app-chart', hydrate: 'visible' });
        expect(html).toContain('hydrate="visible"');
    });

    it('serialises props into <script type="application/json">', () => {
        const html = createIslandHTML({
            component: 'my-counter',
            props: { count: 5, label: 'test' },
        });
        expect(html).toContain('<script type="application/json">');
        expect(html).toContain('"count":5');
        expect(html).toContain('"label":"test"');
    });

    it('emits an empty JSON object when no props are given', () => {
        const html = createIslandHTML({ component: 'my-counter' });
        expect(html).toContain('<script type="application/json">{}');
    });

    it('includes the provided placeholder HTML', () => {
        const html = createIslandHTML({
            component: 'my-counter',
            placeholder: '<span class="ssr">5</span>',
        });
        expect(html).toContain('<span class="ssr">5</span>');
    });

    it('emits a default placeholder when none is given', () => {
        const html = createIslandHTML({ component: 'my-counter' });
        expect(html).toContain('data-island-placeholder="my-counter"');
    });

    it('adds extra attrs from the attrs option', () => {
        const html = createIslandHTML({
            component: 'my-counter',
            attrs: { id: 'hero', class: 'island' },
        });
        expect(html).toContain('id="hero"');
        expect(html).toContain('class="island"');
    });

    it('escapes special chars in component name (attribute)', () => {
        const html = createIslandHTML({ component: 'a"b' });
        expect(html).toContain('component="a&quot;b"');
    });
});

// ── renderIslands ──────────────────────────────────────────────────────────────

describe('renderIslands()', () => {
    it('returns one RenderedIsland per def', () => {
        const { rendered } = renderIslands([
            { component: 'my-counter', props: { count: 0 } },
            { component: 'app-chart',  props: { data: [] }, hydrate: 'visible' },
        ]);
        expect(rendered).toHaveLength(2);
        expect(rendered[0].component).toBe('my-counter');
        expect(rendered[1].component).toBe('app-chart');
    });

    it('each rendered entry has a non-empty html string', () => {
        const { rendered } = renderIslands([
            { component: 'x', props: {} },
        ]);
        expect(rendered[0].html).toContain('<miura-island');
    });

    it('returns a manifest with correct total', () => {
        const { manifest } = renderIslands([
            { component: 'a' },
            { component: 'b' },
            { component: 'a' },
        ]);
        expect(manifest.total).toBe(3);
    });
});

// ── buildManifest ──────────────────────────────────────────────────────────────

describe('buildManifest()', () => {
    it('counts unique (component, hydrate) pairs', () => {
        const manifest = buildManifest([
            { component: 'a', hydrate: 'load',    props: {}, html: '' },
            { component: 'a', hydrate: 'load',    props: {}, html: '' },
            { component: 'b', hydrate: 'visible', props: {}, html: '' },
        ]);

        expect(manifest.total).toBe(3);
        expect(manifest.entries).toHaveLength(2);

        const entryA = manifest.entries.find(e => e.component === 'a')!;
        expect(entryA.count).toBe(2);
        expect(entryA.hydrate).toBe('load');

        const entryB = manifest.entries.find(e => e.component === 'b')!;
        expect(entryB.count).toBe(1);
        expect(entryB.hydrate).toBe('visible');
    });

    it('sets generatedAt to an ISO timestamp', () => {
        const manifest = buildManifest([]);
        expect(manifest.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
});

// ── IslandRegistry ─────────────────────────────────────────────────────────────

describe('IslandRegistry', () => {
    beforeEach(() => {
        IslandRegistry.clear();
    });

    it('registers and retrieves a component definition', () => {
        IslandRegistry.register('my-counter', { props: { count: 0 }, hydrate: 'load' });
        expect(IslandRegistry.has('my-counter')).toBe(true);
        expect(IslandRegistry.get('my-counter')?.props).toEqual({ count: 0 });
    });

    it('renders a registered island with defaults', () => {
        IslandRegistry.register('my-counter', { props: { count: 0 }, hydrate: 'load' });
        const html = IslandRegistry.render('my-counter');
        expect(html).toContain('component="my-counter"');
        expect(html).toContain('"count":0');
    });

    it('merges override props on top of registered defaults', () => {
        IslandRegistry.register('my-counter', { props: { count: 0, label: 'default' } });
        const html = IslandRegistry.render('my-counter', { props: { count: 5 } });
        expect(html).toContain('"count":5');
        expect(html).toContain('"label":"default"');
    });

    it('throws when rendering an unregistered component', () => {
        expect(() => IslandRegistry.render('unknown-tag')).toThrow(
            /Unknown island component: "unknown-tag"/,
        );
    });

    it('renderAll returns one entry per registered component', () => {
        IslandRegistry.register('a', { props: { x: 1 } });
        IslandRegistry.register('b', { props: { y: 2 } });
        const all = IslandRegistry.renderAll();
        expect(all).toHaveLength(2);
        expect(all.map(r => r.component).sort()).toEqual(['a', 'b']);
    });

    it('list() returns all registered tags', () => {
        IslandRegistry.register('x', {});
        IslandRegistry.register('y', {});
        expect(IslandRegistry.list().sort()).toEqual(['x', 'y']);
    });

    it('clear() removes all registrations', () => {
        IslandRegistry.register('x', {});
        IslandRegistry.clear();
        expect(IslandRegistry.has('x')).toBe(false);
    });
});
