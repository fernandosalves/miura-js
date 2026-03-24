# miura Framework

[![MiuraJS Status: Beta](https://img.shields.io/badge/MiuraJS-Beta-f97316?style=flat-square&labelColor=0f172a)](#)
[![npm version](https://img.shields.io/npm/v/@miurajs/miura/alpha?style=flat-square&labelColor=0f172a)](https://www.npmjs.com/package/@miurajs/miura)
[![npm downloads](https://img.shields.io/npm/dm/@miurajs/miura?style=flat-square&labelColor=0f172a)](https://www.npmjs.com/package/@miurajs/miura)

miura is a lightweight, enterprise-ready web component framework designed for building modern, scalable web applications with a simple and intuitive development experience.

## Installation

### Quick Start

Install the complete framework (recommended):

```bash
npm install @miurajs/miura@alpha
```

### Individual Packages

You can also install individual packages:

```bash
# Core framework
npm install @miurajs/miura-element
npm install @miurajs/miura-framework
npm install @miurajs/miura-render

# Optional packages
npm install @miurajs/miura-router
npm install @miurajs/miura-data-flow
npm install @miurajs/miura-ui
npm install @miurajs/miura-security
```

### Usage Example

```typescript
import { MiuraFramework, html } from '@miurajs/miura';

class MyApp extends MiuraFramework {
  static tagName = 'my-app';
  
  static config = {
    app: {
      name: 'My App',
      version: '1.0.0'
    }
  };
  
  render() {
    return html`
      <div class="app">
        <h1>${this.config.app.name}</h1>
        <p>Welcome to miura framework!</p>
      </div>
    `;
  }
}

// Register and mount
customElements.define(MyApp.tagName, MyApp);
document.body.appendChild(new MyApp());
```

## Core Philosophy

- **Lightweight and Performant**: Minimal core with LIS-based keyed diffing, template instance reuse, and virtual scrolling for large lists.
- **Standards-Based**: Built on the Web Components standard, ensuring compatibility and longevity.
- **Developer-Friendly**: Reactive properties, declarative templates, two-way binding, lifecycle hooks, error boundaries, and async rendering.
- **Type-Safe**: Full TypeScript support with decorators, generics, and excellent DX.

## Core Packages

The framework is structured as a monorepo with the following packages:

| Package | Description |
|---------|-------------|
| **`@miurajs/miura`** | Meta-package that bundles and re-exports all framework features |
| **`@miurajs/miura-element`** | Base class for reactive web components — properties, lifecycle, decorators. [README →](./packages/miura-element/README.md) |
| **`@miurajs/miura-render`** | Rendering engine — `html`/`css` tagged templates, parser, bindings, directives. [README →](./packages/miura-render/README.md) |
| **`@miurajs/miura-framework`** | Orchestration layer — plugin manager, event bus, performance monitor |
| **`@miurajs/miura-data-flow`** | State management — store, middleware, 9 data providers (REST, GraphQL, Firebase, etc.) |
| **`@miurajs/miura-ui`** | 70+ pre-built UI components (primitives, navigation, overlay, layout, typography) |
| **`@miurajs/miura-router`** | Client-side router — hash/history/memory modes, guards, loaders, nested routes, layout outlets |
| **`@miurajs/miura-security`** | Auth, AuthZ, CSP, input validation |
| **`@miurajs/miura-debugger`** | Category/level logger for development |
| **`@miurajs/miura-i18n`** | Internationalization — `t()`, dot-notation keys, pluralization, interpolation, fallback locale |
| **`@miurajs/miura-computing`** | Reactive Web Worker bridge — `WorkerBridge`, `expose()`, typed call/stream protocol |
| **`@miurajs/miura-graphics`** | *(Coming Soon)* 2D/3D rendering and animations |
| **`@miurajs/miura-ai`** | *(Coming Soon)* `#stream` directive — progressive token rendering from SSE/WebSocket/ReadableStream |

## Features

### Reactive Properties
- Type-safe property definitions with automatic type conversion
- Property reflection to attributes
- Change notifications and observers
- Automatic DOM updates when properties change

### Computed Properties
- Reactive derived properties that automatically update when dependencies change
- Built-in caching for optimal performance
- Support for both getters and setters

### Template Bindings

| Prefix | Type | Example |
|--------|------|---------|
| *(none)* | Text interpolation | `${this.name}` |
| `@` | Event | `@click=${this.handler}` |
| `.` | Property | `.value=${this.text}` |
| `?` | Boolean attribute | `?disabled=${this.off}` |
| `&` | Two-way binding | `&value=${this.bind('name')}` |
| `#` | Reference / Directive | `#ref`, `#if`, `#for` |
| `class` | Class map | `class=${{ active: true }}` |
| `style` | Style map | `style=${{ color: 'red' }}` |

### Lifecycle Hooks

| Hook | When | Use Case |
|------|------|----------|
| `onMount()` | Once, after first render | Fetch data, init libraries |
| `onUnmount()` | On disconnect | Cleanup, cancel fetches |
| `willUpdate(changed)` | Before each render | Derive values |
| `shouldUpdate(changed)` | Before each render | Skip unnecessary renders |
| `updated(changed)` | After each render | Post-render logic |
| `onError(error)` | On render error | Fallback UI, error reporting |
| `onAdopt()` | adoptedCallback | Document change handling |

### Error Boundaries
Override `onError(error)` to catch rendering errors and display fallback UI. Return `true` to suppress the default `console.error`.

### Two-Way Binding (`&`)
Sync a DOM property with a component property via the appropriate DOM event:

```typescript
// Using the bind() helper
html`<input &value=${this.bind('name')}>`

// Using a tuple [currentValue, setter]
html`<input &value=${[this.name, (v) => this.name = v]}>`
html`<input &checked=${this.bind('agree')}>`
```

### Conditional & List Rendering

```typescript
// Conditional
${when(this.loggedIn,
  () => html`<user-panel .user=${this.user}></user-panel>`,
  () => html`<login-form></login-form>`
)}

// Keyed list (LIS-based diffing for minimal DOM moves)
${repeat(this.items,
  (item) => item.id,
  (item, i) => html`<item-card .data=${item}></item-card>`
)}
```

### Async Rendering

```typescript
// Track a promise
this.tracker = createAsyncTracker(fetchUser(id), () => this.requestUpdate());

// Render per state
${resolveAsync(this.tracker,
  (user) => html`<p>${user.name}</p>`,       // resolved
  ()     => html`<p>Loading...</p>`,          // pending
  (err)  => html`<p>Error: ${err.message}</p>` // rejected
)}
```

### Virtual Scrolling

Use the `#virtualScroll` directive to render only visible items from a large list. The directive manages the scroll container, spacer, and visible slice internally:

```typescript
html`<div #virtualScroll=${{
  items: this.items,       // e.g. 10,000 items
  itemHeight: 40,
  containerHeight: 400,
  render: (item) => html`<div class="row">${item.name}</div>`,
  overscan: 3,
}}></div>`
```

The lower-level `computeVirtualSlice()` function is also available for custom implementations.

### Slot Utilities
- **`querySlotted(name?)`** — Get elements assigned to a slot
- **`onSlotChange(name, callback)`** — React to slot content changes

### AOT / JIT Rendering Compiler

Every component defaults to **JIT** (Just-in-Time) rendering, which supports every binding type including directives, signals, and async bindings. For high-frequency, simple-binding components you can opt into the **AOT** (Ahead-of-Time) path:

```typescript
@component({ tag: 'perf-counter' })
class PerfCounter extends MiuraElement {
  static compiler = 'AOT' as const;  // ← compile once, patch directly
  declare count: number;
  static properties = { count: { type: Number, default: 0 } };

  template() {
    return html`<span>${this.count}</span>`;
  }
}
```

| | JIT (default) | AOT |
|---|---|---|
| First render | `TemplateProcessor` → `Binding[]` objects | `TemplateCompiler` → `render()` → `{ fragment, refs }` |
| Updates | `instance.update(values)` | Direct `refs[N].el.prop = v` — **zero DOM queries** |
| Directives / `repeat()` | ✅ Full support | ✅ Delegated to `NodeBinding` / `DirectiveBinding` instances |
| Best for | All components | High-frequency counters, data tables, list rows |

The AOT compiler generates JS functions via `new Function()` with cached element refs so subsequent updates patch DOM properties directly without any tree traversal.

### Signal-Backed Properties

All `static properties` are backed by `Signal` objects internally. You can also create standalone reactive signals:

```typescript
import { $signal, $computed } from '@miura/miura-element';

const count = $signal(0);
const double = $computed(() => count.get() * 2);

count.set(5); // double automatically becomes 10
```

### Internationalization (`miura-i18n`)

```typescript
import { miuraI18n, I18nMixin } from '@miura/miura-i18n';

miuraI18n.load('en', { greeting: 'Hello, {name}!', items: '{count} item | {count} items' });

@component({ tag: 'my-widget' })
class MyWidget extends I18nMixin(MiuraElement) {
  template() {
    return html`
      <p>${this.t('greeting', { name: 'World' })}</p>
      <p>${this.t('items', { count: 3 })}</p>
    `;
  }
}
```

### Web Worker Bridge (`miura-computing`)

```typescript
// worker.ts
import { expose } from '@miura/miura-computing';
expose({ heavyCalc: (n: number) => n * n });

// component.ts
import { WorkerBridge } from '@miura/miura-computing';
const bridge = new WorkerBridge(new Worker('./worker.ts', { type: 'module' }));
const result = await bridge.call('heavyCalc', 42); // non-blocking
```

### Performance
- **AOT compiler**: Zero DOM queries on update for opted-in components — direct cached-ref property patches
- **LIS-based keyed diff**: O(n log n) algorithm minimizes DOM moves during list reconciliation
- **Template instance reuse**: Same template structure → update values in place, no DOM teardown
- **Virtual scrolling**: Render 10,000+ items with constant DOM footprint
- **Signal-backed properties**: Bindings subscribe directly to signals — no dirty-checking or deep comparison

## Getting Started

```bash
pnpm install
```

### Running Storybook

```bash
pnpm run storybook
```

### Running Tests

```bash
pnpm test
```

## Quick Example

```typescript
import { MiuraElement, html, css, component, repeat } from '@miura/miura-element';

interface Task { id: number; text: string; done: boolean; }

@component({ tag: 'task-list' })
class TaskList extends MiuraElement {
  static compiler = 'AOT' as const; // opt into fast-path rendering
  declare tasks: Task[];
  declare filter: string;

  static properties = {
    tasks:  { type: Array,  default: [] as Task[] },
    filter: { type: String, default: 'all' },
  };

  static state() {
    return { newText: { type: String, default: '' } };
  }

  declare newText: string;

  static styles = css`
    :host { display: block; padding: 1rem; font-family: system-ui; }
    button { padding: 0.4rem 0.8rem; margin: 0 0.2rem; cursor: pointer; }
  `;

  get filtered() {
    return this.filter === 'all' ? this.tasks
      : this.tasks.filter(t => this.filter === 'done' ? t.done : !t.done);
  }

  add = () => {
    if (!this.newText.trim()) return;
    this.tasks = [...this.tasks, { id: Date.now(), text: this.newText, done: false }];
    this.newText = '';
  };

  toggle = (id: number) =>
    this.tasks = this.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);

  template() {
    return html`
      <input .value=${this.newText} @input=${(e: any) => this.newText = e.target.value}>
      <button @click=${this.add}>Add</button>

      <ul>
        ${repeat(this.filtered, t => t.id, t => html`
          <li>
            <input type="checkbox" .checked=${t.done} @change=${() => this.toggle(t.id)}>
            ${t.text}
          </li>
        `)}
      </ul>
    `;
  }
}
```

## License

MIT
