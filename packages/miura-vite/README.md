# `@miurajs/miura-vite`

Vite plugins for the miura framework.

## `islandsPlugin()` — Islands prerender

At build time, scans all HTML files for `<miura-island>` elements and:

1. Injects `<script type="application/json">` with serialised component props when absent.
2. Adds the `hydrate` attribute if missing (uses component config default or `"load"`).
3. Merges config-level default props with any props already in the HTML (HTML wins).
4. Injects a placeholder element when the island body is otherwise empty.
5. Emits an `islands.manifest.json` asset listing every island found across the build.

## Quick Start

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { islandsPlugin } from '@miurajs/miura-vite';

export default defineConfig({
  plugins: [
    islandsPlugin({
      components: {
        'my-counter': {
          props: { count: 0 },
          hydrate: 'load',
          placeholder: '<my-counter count="0">0</my-counter>',
        },
        'app-chart': {
          props: { data: [] },
          hydrate: 'visible',
          placeholder: (props) => `<div class="chart-ph">Loading (${props.data?.length ?? 0} items)…</div>`,
        },
        'like-button': {
          props: { liked: false },
          hydrate: 'idle',
        },
      },
      placeholder: (component) => `<span class="island-ph">${component}</span>`,
      manifest: 'islands.manifest.json',
      verbose: true,
    }),
  ],
});
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `components` | `Record<string, IslandComponentConfig>` | `{}` | Per-component defaults for props, hydrate, and placeholder. |
| `placeholder` | `(component, props) => string` | — | Global fallback placeholder factory. |
| `manifest` | `string \| false` | `"islands.manifest.json"` | Output path for the manifest asset. Set `false` to disable. |
| `verbose` | `boolean` | `true` (if manifest enabled) | Log island summary during build. |

## `IslandComponentConfig`

| Field | Type | Description |
|---|---|---|
| `props` | `Record<string, unknown>` | Default props merged with any already in the HTML. |
| `hydrate` | `string` | Default `hydrate` attribute value. |
| `placeholder` | `string \| (props) => string` | Static HTML or factory to inject when the island body is empty. |

## Example Transform

**Input HTML** (from developer or SSG):
```html
<miura-island component="my-counter"></miura-island>
```

**Output HTML** (after Vite build):
```html
<miura-island component="my-counter" hydrate="load">
  <script type="application/json">{"count":0}</script>
  <my-counter count="0">0</my-counter>
</miura-island>
```

## Manifest Output

`islands.manifest.json` (emitted to `outDir`):
```json
{
  "generatedAt": "2026-03-12T15:00:00.000Z",
  "total": 3,
  "entries": [
    { "component": "my-counter", "hydrate": "load",    "count": 1 },
    { "component": "app-chart",  "hydrate": "visible", "count": 1 },
    { "component": "like-button","hydrate": "idle",    "count": 1 }
  ]
}
```

## Notes

- **Non-nested islands only** — the HTML transform uses a non-greedy regex and does not support `<miura-island>` elements nested inside other `<miura-island>` elements. For deeply nested cases, use `createIslandHTML()` from `@miurajs/miura-element/server` at the template level.
- The plugin runs `enforce: 'pre'` so it processes HTML before other plugins.

## License

MIT
