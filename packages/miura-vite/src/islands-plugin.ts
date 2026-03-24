import type { Plugin } from 'vite';
import type { IslandManifest } from '../../miura-element/src/server/island-renderer.js';
import { buildManifest } from '../../miura-element/src/server/island-renderer.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export type HydrationStrategy = 'load' | 'visible' | 'idle' | string;

export interface IslandComponentConfig {
    /** Default props applied when none are found in the HTML. */
    props?: Record<string, unknown>;
    /** Default hydration strategy if `hydrate` attribute is missing. */
    hydrate?: HydrationStrategy;
    /**
     * Static placeholder HTML injected inside the island when no other
     * placeholder is found. Receives the props object at transform time.
     */
    placeholder?: string | ((props: Record<string, unknown>) => string);
}

export interface IslandsPluginOptions {
    /**
     * Per-component configuration keyed by tag name.
     * Props defined here are merged as defaults — props in HTML take priority.
     */
    components?: Record<string, IslandComponentConfig>;

    /**
     * Global default placeholder factory.
     * Used when a component has no placeholder and no per-component override.
     * Receives the component tag and resolved props.
     */
    placeholder?: (component: string, props: Record<string, unknown>) => string;

    /**
     * Emit a JSON manifest of all islands found across all transformed HTML files.
     * Path is relative to `outDir`. Default: `islands.manifest.json`.
     * Set to `false` to disable.
     */
    manifest?: string | false;

    /**
     * Whether to log a summary of found islands during build.
     * Default: `true` when `manifest !== false`.
     */
    verbose?: boolean;
}

// ── Plugin ─────────────────────────────────────────────────────────────────────

/**
 * Vite plugin for `<miura-island>` prerendering.
 *
 * At build time, this plugin:
 * 1. Scans all HTML files for `<miura-island component="...">` elements.
 * 2. Injects `<script type="application/json">` with serialised props when absent.
 * 3. Injects a static placeholder when the island body is empty.
 * 4. Ensures the `hydrate` attribute is set (defaults to `"load"`).
 * 5. Emits an `islands.manifest.json` summarising all islands in the build.
 *
 * **Usage** (`vite.config.ts`):
 * ```ts
 * import { islandsPlugin } from '@miurajs/miura-vite';
 *
 * export default defineConfig({
 *   plugins: [
 *     islandsPlugin({
 *       components: {
 *         'my-counter':  { props: { count: 0 }, hydrate: 'load' },
 *         'app-chart':   { props: { data: [] }, hydrate: 'visible' },
 *         'like-button': { props: { liked: false }, hydrate: 'idle',
 *                          placeholder: '<span class="like-btn-ssr">♡</span>' },
 *       },
 *       manifest: 'islands.manifest.json',
 *     }),
 *   ],
 * });
 * ```
 */
export function islandsPlugin(options: IslandsPluginOptions = {}): Plugin {
    const {
        components   = {},
        placeholder: globalPlaceholder,
        manifest:    manifestPath  = 'islands.manifest.json',
        verbose      = manifestPath !== false,
    } = options;

    // Accumulate across all HTML files during build
    const allIslands: Array<{ component: string; hydrate: string; props: Record<string, unknown> }> = [];

    return {
        name: 'miura:islands',
        enforce: 'pre',

        // ── HTML transform ────────────────────────────────────────────────────
        transformIndexHtml(html: string): string {
            return _transformIslands(html, {
                components,
                globalPlaceholder,
                onIsland: (component, hydrate, props) => {
                    allIslands.push({ component, hydrate, props });
                },
            });
        },

        // ── Manifest emission ─────────────────────────────────────────────────
        generateBundle(): void {
            if (!manifestPath) return;

            const manifest: IslandManifest = buildManifest(
                allIslands.map(i => ({ ...i, html: '' })),
            );

            this.emitFile({
                type:     'asset',
                fileName: String(manifestPath),
                source:   JSON.stringify(manifest, null, 2),
            });

            if (verbose) {
                const lines = manifest.entries.map(
                    e => `  ${e.component} [${e.hydrate}] × ${e.count}`,
                );
                console.info(
                    `\n[miura:islands] ${manifest.total} island(s) found:\n` + lines.join('\n') + '\n',
                );
            }
        },
    };
}

// ── Internal HTML transformer ─────────────────────────────────────────────────

interface TransformCtx {
    components: Record<string, IslandComponentConfig>;
    globalPlaceholder?: (component: string, props: Record<string, unknown>) => string;
    onIsland: (component: string, hydrate: string, props: Record<string, unknown>) => void;
}

/**
 * Scan `html` for `<miura-island>` blocks and:
 * - Ensure `hydrate` attribute is set.
 * - Inject `<script type="application/json">` if absent.
 * - Inject a placeholder if the island body is otherwise empty.
 *
 * NOTE: Nested `<miura-island>` elements are not supported by this pass
 *       (they are rare / unsemantic). Use `createIslandHTML()` for those.
 */
function _transformIslands(html: string, ctx: TransformCtx): string {
    // Match full <miura-island ...>...</miura-island> blocks.
    // Non-greedy content match works because islands don't nest.
    return html.replace(
        /<miura-island([^>]*)>([\s\S]*?)<\/miura-island>/g,
        (fullMatch, attrsStr: string, innerHtml: string) => {
            return _processIsland(fullMatch, attrsStr, innerHtml, ctx);
        },
    );
}

function _processIsland(
    original: string,
    attrsStr: string,
    innerHtml: string,
    ctx: TransformCtx,
): string {
    const component = _getAttr(attrsStr, 'component');
    if (!component) return original; // can't process without a component

    const cfg = ctx.components[component] ?? {};

    // ── Resolve props ─────────────────────────────────────────────────────────
    let props: Record<string, unknown> = { ...cfg.props };

    const existingScript = _extractJsonScript(innerHtml);
    if (existingScript !== null) {
        // Merge: HTML props override config defaults
        props = { ...props, ...existingScript };
    }

    // ── Resolve hydrate ───────────────────────────────────────────────────────
    let hydrate = _getAttr(attrsStr, 'hydrate') ?? cfg.hydrate ?? 'load';

    // ── Notify collector ──────────────────────────────────────────────────────
    ctx.onIsland(component, hydrate, props);

    // ── Build patched inner HTML ──────────────────────────────────────────────
    let newInner = innerHtml;

    // Inject / replace <script type="application/json">
    const propsJson = JSON.stringify(props);
    const scriptTag = `<script type="application/json">${propsJson}</script>`;

    if (existingScript !== null) {
        // Replace existing script with merged props
        newInner = newInner.replace(/<script type="application\/json">[\s\S]*?<\/script>/, scriptTag);
    } else {
        newInner = scriptTag + '\n  ' + newInner.trimStart();
    }

    // Inject placeholder if island body is otherwise empty after removing the script tag
    const bodyWithoutScript = newInner
        .replace(/<script type="application\/json">[\s\S]*?<\/script>/, '')
        .trim();

    if (!bodyWithoutScript) {
        const ph = _resolvePlaceholder(component, props, cfg, ctx.globalPlaceholder);
        newInner = newInner.trimEnd() + '\n  ' + ph + '\n';
    }

    // ── Rebuild attributes ────────────────────────────────────────────────────
    let newAttrs = attrsStr;

    // Ensure hydrate attribute is present with resolved value
    if (!_getAttr(attrsStr, 'hydrate')) {
        newAttrs = newAttrs.trimEnd() + ` hydrate="${_escAttr(hydrate)}"`;
    }

    return `<miura-island${newAttrs}>${newInner}</miura-island>`;
}

// ── Attribute helpers ─────────────────────────────────────────────────────────

function _getAttr(attrsStr: string, name: string): string | null {
    const match = attrsStr.match(new RegExp(`${name}="([^"]*)"`, 'i'))
               || attrsStr.match(new RegExp(`${name}='([^']*)'`, 'i'))
               || attrsStr.match(new RegExp(`${name}=([^\\s>]+)`, 'i'));
    return match ? match[1] : null;
}

function _extractJsonScript(innerHtml: string): Record<string, unknown> | null {
    const match = innerHtml.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) return null;
    try {
        const parsed = JSON.parse(match[1]);
        return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null;
    } catch {
        return null;
    }
}

function _resolvePlaceholder(
    component: string,
    props: Record<string, unknown>,
    cfg: IslandComponentConfig,
    globalPh?: (component: string, props: Record<string, unknown>) => string,
): string {
    const cfgPh = cfg.placeholder;
    if (cfgPh) {
        return typeof cfgPh === 'function' ? cfgPh(props) : cfgPh;
    }
    if (globalPh) {
        return globalPh(component, props);
    }
    // Default minimal placeholder
    return `<span data-island-placeholder="${_escAttr(component)}" aria-hidden="true"></span>`;
}

function _escAttr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
