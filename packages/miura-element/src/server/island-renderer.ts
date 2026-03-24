/**
 * Server-side utilities for `<miura-island>` prerendering.
 *
 * These utilities run in Node.js (or any non-browser JS runtime) and generate
 * the island HTML that the browser's `MiuraIsland` custom element will hydrate.
 *
 * **Zero DOM dependency** — safe to import in SSR/SSG contexts.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type HydrationStrategy = 'load' | 'visible' | 'idle' | string;

/**
 * Definition for a single island instance.
 *
 * `TProps` is the props type — kept as `Record<string, unknown>` by default
 * to allow passing rich objects, arrays, booleans, and numbers through
 * `<script type="application/json">` without attribute serialization loss.
 */
export interface IslandDef<TProps extends Record<string, unknown> = Record<string, unknown>> {
    /** Custom element tag name to mount on hydration. */
    component: string;

    /** Props to serialize into `<script type="application/json">`. */
    props?: TProps;

    /** Hydration strategy. Default: `"load"`. */
    hydrate?: HydrationStrategy;

    /**
     * Static placeholder HTML rendered inside the island.
     * Shown before JS loads / hydration fires.
     * If omitted, a minimal `<span>` placeholder is generated.
     */
    placeholder?: string;

    /**
     * Extra HTML attributes to set on the `<miura-island>` element.
     * E.g. `{ id: 'hero-counter', class: 'my-island' }`.
     */
    attrs?: Record<string, string>;
}

/** A resolved island instance including its serialised HTML. */
export interface RenderedIsland {
    component: string;
    hydrate: HydrationStrategy;
    props: Record<string, unknown>;
    /** The full `<miura-island>…</miura-island>` HTML string. */
    html: string;
}

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
export function createIslandHTML(def: IslandDef): string {
    const hydrate    = def.hydrate ?? 'load';
    const props      = def.props   ?? {};
    const placeholder = def.placeholder ?? _defaultPlaceholder(def.component);

    const extraAttrs = def.attrs
        ? ' ' + Object.entries(def.attrs).map(([k, v]) => `${_esc(k)}="${_escAttr(v)}"`).join(' ')
        : '';

    const propsJson  = JSON.stringify(props);
    const scriptTag  = `  <script type="application/json">${propsJson}</script>`;

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
export function renderIslands(defs: IslandDef[]): {
    rendered: RenderedIsland[];
    manifest: IslandManifest;
} {
    const rendered: RenderedIsland[] = defs.map(def => ({
        component: def.component,
        hydrate:   def.hydrate ?? 'load',
        props:     def.props   ?? {},
        html:      createIslandHTML(def),
    }));

    const manifest = buildManifest(rendered);
    return { rendered, manifest };
}

// ── Manifest ───────────────────────────────────────────────────────────────────

export interface IslandManifestEntry {
    component: string;
    hydrate: HydrationStrategy;
    count: number;
}

export interface IslandManifest {
    /** ISO timestamp of when the manifest was generated. */
    generatedAt: string;
    /** Total number of islands. */
    total: number;
    /** One entry per unique (component, hydrate) combination. */
    entries: IslandManifestEntry[];
}

/** Build an `IslandManifest` from a list of rendered islands. */
export function buildManifest(islands: RenderedIsland[]): IslandManifest {
    const counts = new Map<string, IslandManifestEntry>();

    for (const island of islands) {
        const key = `${island.component}::${island.hydrate}`;
        if (counts.has(key)) {
            counts.get(key)!.count++;
        } else {
            counts.set(key, {
                component: island.component,
                hydrate:   island.hydrate,
                count:     1,
            });
        }
    }

    return {
        generatedAt: new Date().toISOString(),
        total:       islands.length,
        entries:     Array.from(counts.values()),
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
    private static _defs = new Map<string, Omit<IslandDef, 'component'>>();

    /**
     * Register default configuration for an island.
     * Per-call props in `render()` are **merged** on top of these defaults.
     */
    static register(component: string, def: Omit<IslandDef, 'component'>): void {
        this._defs.set(component, def);
    }

    /** Returns true if `component` has been registered. */
    static has(component: string): boolean {
        return this._defs.has(component);
    }

    /** Return the registered defaults for a component, or `undefined`. */
    static get(component: string): Omit<IslandDef, 'component'> | undefined {
        return this._defs.get(component);
    }

    /**
     * Render a registered island to HTML, merging `overrides` on top of the
     * registered defaults.
     *
     * @throws if `component` was never registered.
     */
    static render(component: string, overrides?: Partial<IslandDef>): string {
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
    static renderAll(overrides?: Record<string, Partial<IslandDef>>): RenderedIsland[] {
        return Array.from(this._defs.entries()).map(([component, def]) => {
            const merged: IslandDef = {
                ...def,
                ...overrides?.[component],
                component,
                props: { ...def.props, ...overrides?.[component]?.props },
            };
            return {
                component,
                hydrate: merged.hydrate ?? 'load',
                props:   merged.props   ?? {},
                html:    createIslandHTML(merged),
            };
        });
    }

    /** Remove all registrations — useful in tests. */
    static clear(): void {
        this._defs.clear();
    }

    /** List all registered component tags. */
    static list(): string[] {
        return Array.from(this._defs.keys());
    }
}

// ── Internal helpers ───────────────────────────────────────────────────────────

function _defaultPlaceholder(component: string): string {
    return `<span data-island-placeholder="${_escAttr(component)}" aria-hidden="true"></span>`;
}

function _escAttr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _esc(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]/g, '');
}
