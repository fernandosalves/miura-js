/**
 * Server-side entry point for `@miurajs/miura-element`.
 *
 * Import from `@miurajs/miura-element/server` in Node.js / SSR / SSG contexts.
 * This module has **zero browser DOM dependencies** — safe to use in any runtime.
 *
 * ```ts
 * import { createIslandHTML, IslandRegistry } from '@miurajs/miura-element/server';
 * ```
 */
export {
    createIslandHTML,
    renderIslands,
    buildManifest,
    IslandRegistry,
} from './src/server/island-renderer.js';

export type {
    IslandDef,
    RenderedIsland,
    IslandManifest,
    IslandManifestEntry,
    HydrationStrategy,
} from './src/server/island-renderer.js';
