/**
 * Server-side utilities for `<miura-island>` prerendering.
 *
 * These utilities run in Node.js (or any non-browser JS runtime) and generate
 * the island HTML that the browser's `MiuraIsland` custom element will hydrate.
 *
 * **Zero DOM dependency** — safe to import in SSR/SSG contexts.
 */
// ── Core utilities ─────────────────────────────────────────────────────────────
/**
 * Serialise a single island definition into a `<miura-island>` HTML string.
 *
 * ```ts
 * import { createIslandHTML } from '@miurajs/miura-element/server';
 *
 * const html = createIslandHTML({
 *   component: 'my-counter',
 *   props: { count: 5 },
 *   hydrate: 'visible',
 *   placeholder: '<my-counter count="5">5</my-counter>',
 * });
 * ```
 *
 * Output:
 * ```html
 * <miura-island component="my-counter" hydrate="visible">
 *   <script type="application/json">{"count":5}</script>
 *   <my-counter count="5">5</my-counter>
 * </miura-island>
 * ```
 */
export function createIslandHTML(def) {
    const hydrate = def.hydrate ?? 'load';
    const props = def.props ?? {};
    const placeholder = def.placeholder ?? _defaultPlaceholder(def.component);
    const extraAttrs = def.attrs
        ? ' ' + Object.entries(def.attrs).map(([k, v]) => `${_esc(k)}="${_escAttr(v)}"`).join(' ')
        : '';
    const propsJson = JSON.stringify(props);
    const scriptTag = `  <script type="application/json">${propsJson}</script>`;
    return [
        `<miura-island component="${_escAttr(def.component)}" hydrate="${_escAttr(hydrate)}"${extraAttrs}>`,
        scriptTag,
        placeholder ? `  ${placeholder}` : '',
        `</miura-island>`,
    ].filter(Boolean).join('\n');
}
/**
 * Render an array of island definitions to their HTML strings and return
 * both the individual `html` strings and a structured manifest.
 *
 * Useful for SSR templates that need to inject islands at multiple positions.
 *
 * ```ts
 * const { rendered, manifest } = renderIslands([
 *   { component: 'my-counter', props: { count: 5 } },
 *   { component: 'app-chart',  props: { data: [1,2,3] }, hydrate: 'visible' },
 * ]);
 * ```
 */
export function renderIslands(defs) {
    const rendered = defs.map(def => ({
        component: def.component,
        hydrate: def.hydrate ?? 'load',
        props: def.props ?? {},
        html: createIslandHTML(def),
    }));
    const manifest = buildManifest(rendered);
    return { rendered, manifest };
}
/** Build an `IslandManifest` from a list of rendered islands. */
export function buildManifest(islands) {
    const counts = new Map();
    for (const island of islands) {
        const key = `${island.component}::${island.hydrate}`;
        if (counts.has(key)) {
            counts.get(key).count++;
        }
        else {
            counts.set(key, {
                component: island.component,
                hydrate: island.hydrate,
                count: 1,
            });
        }
    }
    return {
        generatedAt: new Date().toISOString(),
        total: islands.length,
        entries: Array.from(counts.values()),
    };
}
// ── Island Registry ────────────────────────────────────────────────────────────
/**
 * A static registry of island definitions keyed by component tag.
 *
 * Register islands once (e.g. at app initialisation), then look them up
 * during SSR to resolve default props and placeholders without passing
 * them everywhere.
 *
 * ```ts
 * import { IslandRegistry } from '@miurajs/miura-element/server';
 *
 * IslandRegistry.register('my-counter',  { props: { count: 0 },    hydrate: 'load'    });
 * IslandRegistry.register('app-chart',   { props: { data: [] },    hydrate: 'visible' });
 * IslandRegistry.register('like-button', { props: { liked: false}, hydrate: 'idle'    });
 *
 * // Later, in a route handler:
 * const html = IslandRegistry.render('my-counter', { count: 5 });
 * ```
 */
export class IslandRegistry {
    static _defs = new Map();
    /**
     * Register default configuration for an island.
     * Per-call props in `render()` are **merged** on top of these defaults.
     */
    static register(component, def) {
        this._defs.set(component, def);
    }
    /** Returns true if `component` has been registered. */
    static has(component) {
        return this._defs.has(component);
    }
    /** Return the registered defaults for a component, or `undefined`. */
    static get(component) {
        return this._defs.get(component);
    }
    /**
     * Render a registered island to HTML, merging `overrides` on top of the
     * registered defaults.
     *
     * @throws if `component` was never registered.
     */
    static render(component, overrides) {
        const defaults = this._defs.get(component);
        if (!defaults) {
            throw new Error(`[IslandRegistry] Unknown island component: "${component}". ` +
                `Did you forget to call IslandRegistry.register("${component}", ...)?`);
        }
        return createIslandHTML({
            ...defaults,
            ...overrides,
            component,
            props: { ...defaults.props, ...overrides?.props },
        });
    }
    /**
     * Render every registered island with its defaults.
     * Useful for generating a full-page manifest or testing.
     */
    static renderAll(overrides) {
        return Array.from(this._defs.entries()).map(([component, def]) => {
            const merged = {
                ...def,
                ...overrides?.[component],
                component,
                props: { ...def.props, ...overrides?.[component]?.props },
            };
            return {
                component,
                hydrate: merged.hydrate ?? 'load',
                props: merged.props ?? {},
                html: createIslandHTML(merged),
            };
        });
    }
    /** Remove all registrations — useful in tests. */
    static clear() {
        this._defs.clear();
    }
    /** List all registered component tags. */
    static list() {
        return Array.from(this._defs.keys());
    }
}
// ── Internal helpers ───────────────────────────────────────────────────────────
function _defaultPlaceholder(component) {
    return `<span data-island-placeholder="${_escAttr(component)}" aria-hidden="true"></span>`;
}
function _escAttr(value) {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function _esc(value) {
    return value.replace(/[^a-zA-Z0-9_-]/g, '');
}
