# @miura/miura-element

The core component system for the miura framework. Provides the `MiuraElement` base class for creating reactive web components with properties, computed properties, lifecycle hooks, error boundaries, two-way binding, and slot utilities.

## Features

- **Reactive Properties** — Type-safe definitions with automatic type conversion and attribute reflection; each property is signal-backed
- **Internal State** — `static state()` for private, non-reflected reactive state fields
- **Computed Properties** — Derived values with dependency tracking and caching
- **Lifecycle Hooks** — `onMount`, `onUnmount`, `willUpdate`, `shouldUpdate`, `updated`, `onAdopt`
- **Error Boundaries** — `onError` handler with fallback UI and recovery
- **Two-Way Binding** — `&` prefix with `bind()` helper for form elements
- **AOT / JIT Compiler** — `static compiler = 'AOT'` to opt a component into the zero-DOM-query render path
- **Standalone Signals** — `$signal()` and `$computed()` for use outside components
- **Slot Utilities** — `querySlotted()` and `onSlotChange()` for managing distributed content
- **Decorators** — `@component`, `@property`, `@computed` for concise definitions
- **Islands Architecture** — `<miura-island>` wrapper for partial hydration with `load`, `visible`, and `idle` strategies
- **TypeScript** — Full type safety with excellent DX

## Installation

```bash
pnpm add @miura/miura-element
```

## Quick Start

```typescript
import { MiuraElement, html, css, component } from '@miura/miura-element';

@component({ tag: 'my-counter' })
class Counter extends MiuraElement {
  declare count: number;

  static properties = {
    count: { type: Number, default: 0 }
  };

  static styles = css`
    :host { display: block; padding: 1rem; }
    button { padding: 0.5rem 1rem; margin: 0 0.5rem; cursor: pointer; }
  `;

  increment = () => { this.count++; };
  decrement = () => { this.count--; };

  template() {
    return html`
      <h3>Count: ${this.count}</h3>
      <button @click=${this.decrement}>-</button>
      <button @click=${this.increment}>+</button>
    `;
  }
}
```

## API Reference

### Reactive Properties

```typescript
static properties = {
  name:     { type: String,  default: 'John' },
  age:      { type: Number,  default: 30 },
  active:   { type: Boolean, default: false },
  items:    { type: Array,   default: [] },
  config:   { type: Object,  default: {} }
};
```

| Option | Description |
|--------|-------------|
| `type` | `String`, `Number`, `Boolean`, `Array`, `Object` |
| `default` | Default value |
| `reflect` | Reflect to HTML attribute (default: `false`) |
| `attribute` | Custom attribute name (default: lowercase property name) |

### Computed Properties

```typescript
static computed() {
  return {
    fullName: {
      dependencies: ['firstName', 'lastName'],
      get() { return `${this.firstName} ${this.lastName}`.trim(); }
    },
    birthYear: {
      dependencies: ['age'],
      get() { return new Date().getFullYear() - this.age; },
      set(value: number) { this.age = new Date().getFullYear() - value; }
    }
  };
}
```

### Styles

```typescript
static styles = css`
  :host { display: block; padding: 1rem; }
  .title { font-size: 1.5rem; font-weight: bold; }
`;
```

### Lifecycle Hooks

| Hook | When | Use Case |
|------|------|----------|
| `onMount()` | Once, after first render | Fetch data, init third-party libraries |
| `onUnmount()` | On disconnect | Cancel fetches, dispose resources |
| `willUpdate(changed)` | Before each render | Derive values from changed properties |
| `shouldUpdate(changed)` | Before each render | Return `false` to skip an unnecessary render |
| `updated(changed)` | After each render | Post-render DOM operations |
| `onAdopt()` | `adoptedCallback` | Handle document changes |

```typescript
@component({ tag: 'my-widget' })
class MyWidget extends MiuraElement {
  onMount() {
    this.data = await fetch('/api/data').then(r => r.json());
  }

  onUnmount() {
    this.abortController?.abort();
  }

  willUpdate(changed) {
    if (changed.has('items')) {
      this.filteredItems = this.items.filter(i => i.active);
    }
  }

  shouldUpdate(changed) {
    // Skip renders that only change internal bookkeeping
    return !changed.has('_internalTick');
  }
}
```

### Error Boundaries

Override `onError(error)` to catch rendering errors. Return `true` to suppress `console.error`.

```typescript
@component({ tag: 'safe-widget' })
class SafeWidget extends MiuraElement {
  onError(error: Error): boolean {
    this.shadowRoot!.innerHTML = `
      <div class="error">
        <h3>Something went wrong</h3>
        <p>${error.message}</p>
        <button onclick="this.getRootNode().host.recover()">Retry</button>
      </div>
    `;
    return true; // suppress console.error
  }
}
```

### Two-Way Binding (`&`)

The `&` prefix creates a two-way binding that sets a DOM property and listens for the corresponding event to push changes back.

```typescript
template() {
  return html`
    <!-- Using the bind() helper (recommended) -->
    <input &value=${this.bind('name')}>
    <input type="checkbox" &checked=${this.bind('agree')}>

    <!-- Using a tuple [currentValue, setter] -->
    <input &value=${[this.email, (v) => this.email = v]}>
  `;
}
```

**Auto-detected events:**

| Property | Event |
|----------|-------|
| `value` | `input` |
| `checked` | `change` |
| `selected` | `change` |
| `files` | `change` |
| *(other)* | `input` |

### Slot Utilities

```typescript
@component({ tag: 'my-card' })
class MyCard extends MiuraElement {
  onMount() {
    // Query slotted elements
    const headerEls = this.querySlotted('header');

    // React to slot changes
    this.onSlotChange('', (elements) => {
      this.hasContent = elements.length > 0;
    });
  }

  template() {
    return html`
      <div class="card">
        <slot name="header"></slot>
        <slot></slot>
        <slot name="footer"></slot>
      </div>
    `;
  }
}
```

### Template Binding Reference

| Prefix | Type | Example |
|--------|------|---------|
| *(none)* | Text / Node | `${this.name}` |
| `@` | Event | `@click=${this.handler}` |
| `.` | Property | `.value=${this.text}` |
| `?` | Boolean attribute | `?disabled=${this.off}` |
| `&` | Two-way binding | `&value=${this.bind('name')}` |
| `#` | Reference / Directive | `#ref`, `#if`, `#for` |
| `class` | Class map | `class=${{ active: true }}` |
| `style` | Style object | `style=${{ color: 'red' }}` |

Event modifiers via `|`: `@click|prevent=${handler}`, `@click|prevent,stop=${handler}`

### Conditional Rendering

```typescript
import { when, choose } from '@miura/miura-element';

// when(condition, trueCase, falseCase?)
${when(this.loggedIn,
  () => html`<user-panel></user-panel>`,
  () => html`<login-form></login-form>`
)}

// choose(value, [...cases], default?)
${choose(this.status, [
  ['loading', () => html`<spinner></spinner>`],
  ['error',   () => html`<error-msg></error-msg>`],
  ['ready',   () => html`<content></content>`],
])}
```

### Keyed List Rendering

```typescript
import { repeat } from '@miura/miura-element';

${repeat(this.items,
  (item) => item.id,                              // key function
  (item, i) => html`<item-card .data=${item}>`     // template function
)}
```

Uses an **LIS-based (Longest Increasing Subsequence) diffing algorithm** to compute the minimal set of DOM moves when items are reordered.

### Async Rendering

```typescript
import { createAsyncTracker, resolveAsync } from '@miura/miura-element';

// Create tracker (e.g. in onMount or event handler)
this.userTracker = createAsyncTracker(
  fetchUser(this.userId),
  () => this.requestUpdate()
);

// In template()
${resolveAsync(this.userTracker,
  (user) => html`<p>Hello ${user.name}</p>`,       // resolved
  ()     => html`<p>Loading...</p>`,                // pending
  (err)  => html`<p>Error: ${err.message}</p>`      // rejected
)}
```

### Virtual Scrolling

Use the `#virtualScroll` directive to virtualize a large list. The directive manages the scroll container, spacer, and visible slice internally — no manual scroll listeners needed:

```typescript
template() {
  return html`
    <div #virtualScroll=${{
      items: this.items,       // full list (e.g. 10,000 items)
      itemHeight: 40,          // fixed row height in px
      containerHeight: 400,    // viewport height in px
      render: (item, i) => html`<div class="row">${item.name}</div>`,
      overscan: 3,             // extra rows above/below viewport
    }}></div>
  `;
}
```

The lower-level `computeVirtualSlice()` function is also available for custom implementations:

```typescript
import { computeVirtualSlice } from '@miura/miura-element';

const vs = computeVirtualSlice({
  items: this.items,
  itemHeight: 40,
  containerHeight: 400,
  render: (item, i) => html`<div class="row">${item.name}</div>`,
  overscan: 3,
}, this.scrollTop);

// vs.visibleItems, vs.totalHeight, vs.startIndex, etc.
```

### Internal State (`static state()`)

Use `static state()` for reactive fields that are private to the component and should **not** reflect to HTML attributes:

```typescript
@component({ tag: 'search-box' })
class SearchBox extends MiuraElement {
  // Public properties — reflected, observable from outside
  static properties = {
    placeholder: { type: String, default: '' },
  };

  // Internal state — reactive but not reflected
  static state() {
    return {
      query:     { type: String,  default: '' },
      loading:   { type: Boolean, default: false },
      results:   { type: Array,   default: [] },
    };
  }

  declare placeholder: string;
  declare query: string;
  declare loading: boolean;
  declare results: unknown[];
}
```

### AOT / JIT Rendering Compiler

Every component defaults to **JIT** (Just-in-Time) rendering via the `TemplateProcessor` pipeline, which supports every binding type. Add `static compiler = 'AOT' as const` to opt a component class into the faster compiled path:

```typescript
@component({ tag: 'data-row' })
class DataRow extends MiuraElement {
  static compiler = 'AOT' as const;
  declare label: string;
  declare value: number;
  static properties = {
    label: { type: String, default: '' },
    value: { type: Number, default: 0 },
  };

  template() {
    return html`<td>${this.label}</td><td>${this.value}</td>`;
  }
}
```

| | JIT (default) | AOT |
|---|---|---|
| First render | `TemplateProcessor` → `Binding[]` | `TemplateCompiler` → `render()` → `{ fragment, refs }` |
| Updates | `instance.update(values)` | Direct `refs[N].el.prop = v` — **zero DOM queries** |
| Directives / `repeat()` | ✅ Full support | ✅ Delegated to `NodeBinding` / `DirectiveBinding` |
| Best for | All components | High-frequency updates, list rows, counters |

### Standalone Signals

Create reactive values outside of components:

```typescript
import { $signal, $computed } from '@miura/miura-element';

const count = $signal(0);
const label = $computed(() => `Count: ${count.get()}`);

count.set(count.get() + 1);
console.log(label.get()); // 'Count: 1'
```

Signals created with `$signal()` / `$computed()` can be passed directly into `html` bindings — `BindingManager` subscribes to them automatically so bindings update without triggering a full component re-render.

## Best Practices

1. **Use computed properties for derived state** instead of manual updates
2. **Keep dependency arrays minimal** — only what the computed actually reads
3. **Use `static state()` for internal UI state** — keeps it off attributes and out of observed properties
4. **Use arrow functions for event handlers** — automatic `this` binding
5. **Use `static compiler = 'AOT'` for hot paths** — rows, counters, table cells that update frequently
6. **Use `shouldUpdate` sparingly** — only to skip truly unnecessary renders
7. **Clean up in `onUnmount`** — abort controllers, remove global listeners, dispose resources
8. **Use `&` binding for forms** — cleaner than manual `@input` + `.value` wiring

## 🖥️ Server-side Utilities (`@miura/miura-element/server`)

Import from `@miura/miura-element/server` in Node.js / SSR / SSG contexts. **Zero DOM dependency.**

```ts
import { createIslandHTML, IslandRegistry, renderIslands } from '@miura/miura-element/server';
```

### `createIslandHTML(def)`

Generate a single `<miura-island>` HTML string from a definition object:

```ts
const html = createIslandHTML({
  component: 'my-counter',
  props:     { count: 5 },
  hydrate:   'visible',
  placeholder: '<my-counter count="5">5</my-counter>',
});
// → <miura-island component="my-counter" hydrate="visible">
//     <script type="application/json">{"count":5}</script>
//     <my-counter count="5">5</my-counter>
//   </miura-island>
```

### `IslandRegistry`

Register island defaults once at app boot; look them up anywhere in your SSR templates:

```ts
IslandRegistry.register('my-counter', { props: { count: 0 }, hydrate: 'load' });
IslandRegistry.register('app-chart',  { props: { data: [] }, hydrate: 'visible' });

// In a route handler — override props per-request
const html = IslandRegistry.render('my-counter', { props: { count: req.session.count } });
```

### `renderIslands(defs)`

Batch-render an array of island definitions and get a typed manifest back:

```ts
const { rendered, manifest } = renderIslands([
  { component: 'my-counter', props: { count: 5 } },
  { component: 'app-chart',  props: { data: [] }, hydrate: 'visible' },
]);
// manifest.total === 2
// manifest.entries[].component, .hydrate, .count
```

## 🏝️ Islands Architecture (`<miura-island>`)

`<miura-island>` is a partial hydration wrapper. It renders static SSR'd HTML immediately and lazily creates the interactive component when the chosen strategy fires.

```html
<!-- Hydrate immediately (default) -->
<miura-island component="my-counter">
  <script type="application/json">{"count": 5}</script>
  <!-- SSR placeholder shown before JS runs -->
  <my-counter count="5">5</my-counter>
</miura-island>

<!-- Hydrate when scrolled into view -->
<miura-island component="app-chart" hydrate="visible">
  <script type="application/json">{"data": [1,2,3]}</script>
  <div class="chart-placeholder">…</div>
</miura-island>

<!-- Hydrate during browser idle time -->
<miura-island component="like-button" hydrate="idle" data-props='{"liked":false}'>
</miura-island>
```

### Hydration strategies

| `hydrate` value | When it fires |
|---|---|
| `"load"` (default) | Immediately in `connectedCallback` |
| `"visible"` | When the island enters the viewport (`IntersectionObserver`, 200 px root margin) |
| `"idle"` | During browser idle time (`requestIdleCallback`, 2 s timeout fallback) |
| anything else | Never — call `island.hydrate()` imperatively |

### Props channel

Props are applied as **properties** (not attributes) on the created element for full type fidelity:

1. First source: `<script type="application/json">` child element (recommended for SSR)
2. Second source: `data-props` attribute (JSON string)

### Events

`miura-island:hydrated` bubbles from the island after the component mounts. `event.detail.element` is the created component, `event.detail.props` are the resolved props.

```typescript
island.addEventListener('miura-island:hydrated', (e) => {
  console.log('hydrated', e.detail.element);
});

// Imperative hydration
island.hydrate();
```

## License

MIT
