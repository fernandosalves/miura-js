# @miurajs/miura-render

The rendering engine for the miura framework. Provides tagged template literals (`html`/`css`), a state-machine parser, a binding manager, structural directives, and performance utilities including LIS-based keyed diffing, async rendering, and virtual scrolling.

## Features

- **Tagged Templates** — `html` and `css` tagged template literals
- **State-Machine Parser** — Correctly handles text, attribute, and multi-expression contexts
- **Binding Manager** — 10 binding types: Node, Property, Event, Boolean, Class, Style, Attribute, Reference, Directive, Bind
- **Structural Directives** — `#if`, `#for`, `#switch` with lazy loading support
- **Functional Directives** — `when()`, `choose()`, `repeat()`, `resolveAsync()`, `computeVirtualSlice()`
- **LIS-Based Keyed Diff** — O(n log n) algorithm for minimal DOM moves during list reconciliation
- **Template Instance Reuse** — Same template structure = update values in place, skip DOM teardown
- **Directive System** — Extensible with `@directive` / `@lazyDirective` decorators

## Installation

```bash
pnpm add @miurajs/miura-render
```

## Template Syntax

### Text Interpolation

```typescript
html`<h1>Hello ${this.name}</h1>`
```

### Binding Prefixes

| Prefix | Type | Description |
|--------|------|-------------|
| *(none)* | Node | Text content or nested templates |
| `@` | Event | DOM event listener with modifier support |
| `.` | Property | Set a DOM property directly |
| `?` | Boolean | Toggle an HTML attribute on/off |
| `&` | Bind | Two-way binding (property + event listener) |
| `#` | Directive / Ref | Structural directives or element references |
| `class` | Class | Object map to class list |
| `style` | Style | Object map to inline styles |

### Event Binding

```typescript
html`<button @click=${this.handleClick}>Click</button>`

// With modifiers
html`<form @submit|prevent=${this.handleSubmit}>...</form>`
html`<button @click|prevent,stop=${this.handler}>Go</button>`
```

### Property Binding

```typescript
html`<input .value=${this.text}>`
html`<my-component .data=${this.config}>`
```

Prefer node bindings for rendered subtrees. For sanitized or framework-owned HTML, use
`trustedHTML()` instead of assigning `.innerHTML` directly:

```typescript
import { enhance, html, trustedHTML } from '@miurajs/miura-render';

html`
  <article>
    ${trustedHTML(cleanHtml, {
      afterRender: enhance(
        (root) => renderMermaid(root),
        (root) => mountEmbeds(root)
      )
    })}
  </article>
`
```

`trustedHTML()` is intentionally explicit: Miura inserts the string as DOM and
does not sanitize it. Sanitize user-provided content before wrapping it.
`trustHTML()` remains available as a backwards-compatible alias.

### Boolean Binding

```typescript
html`<button ?disabled=${this.loading}>Submit</button>`
html`<details ?open=${this.expanded}>...</details>`
```

### Two-Way Binding (`&`)

```typescript
// Tuple form: [currentValue, setter]
html`<input &value=${[this.name, (v) => this.name = v]}>`

// Binder object form: { value, set }
html`<input &value=${{ value: this.name, set: (v) => this.name = v }}>`
```

Auto-detected events: `value` -> `input`, `checked`/`selected`/`files` -> `change`.

### Class Binding

```typescript
html`<div class=${{ active: this.isActive, disabled: this.off }}>...</div>`
```

### Style Binding

```typescript
html`<div style=${{ color: 'red', fontSize: '16px' }}>...</div>`
```

### Multi-Expression Attributes

```typescript
html`<div title="Hello ${this.first} ${this.last}">...</div>`
```

Multiple expressions in the same attribute are automatically grouped and concatenated.

## Functional Directives

### `when(condition, trueCase, falseCase?)`

Conditional rendering. Only the active branch is evaluated.

```typescript
${when(this.loggedIn,
  () => html`<user-panel></user-panel>`,
  () => html`<login-form></login-form>`
)}
```

### `choose(value, cases, defaultCase?)`

Multi-branch conditional (like a switch expression).

```typescript
${choose(this.view, [
  ['list',   () => html`<list-view></list-view>`],
  ['grid',   () => html`<grid-view></grid-view>`],
  ['detail', () => html`<detail-view></detail-view>`],
], () => html`<not-found></not-found>`)}
```

### `repeat(items, keyFn, templateFn)`

Keyed list rendering with **LIS-based diffing**.

```typescript
${repeat(this.items,
  (item) => item.id,
  (item, index) => html`<item-row .data=${item}></item-row>`
)}
```

The algorithm identifies items already in correct relative order (via Longest Increasing Subsequence), then only moves out-of-order items. Minimizes DOM operations from O(n) to O(n - LIS length).

### `resolveAsync(tracker, resolved, pending?, rejected?)`

Declarative promise-based rendering.

```typescript
import { createAsyncTracker, resolveAsync } from '@miurajs/miura-render';

// Create a tracker
const tracker = createAsyncTracker(
  fetch('/api/user').then(r => r.json()),
  () => this.requestUpdate()
);

// Render based on state
${resolveAsync(tracker,
  (data) => html`<p>${data.name}</p>`,
  ()     => html`<p>Loading...</p>`,
  (err)  => html`<p>Error: ${err.message}</p>`
)}
```

### `#async` Directive

Directive that tracks a Promise and renders `<template pending>`, `<template resolved>`, or `<template rejected>` — the same pattern as `#switch` with `<template case>` / `<template default>`:

```html
<div #async=${this.userPromise}>
  <template pending>
    <p>Loading…</p>
  </template>
  <template resolved>
    <p>Data loaded!</p>
  </template>
  <template rejected>
    <p>Something went wrong.</p>
  </template>
</div>
```

The directive:
- Scans child `<template>` elements for `pending`, `resolved`, `rejected` attributes
- Shows the `pending` template immediately when a new promise is assigned
- Swaps to `resolved` or `rejected` when the promise settles
- Ignores stale promises if a new one is assigned before settlement

### `#virtualScroll` Directive

Structural directive that virtualizes a large list. Manages the scroll container, spacer, and visible slice internally — no manual scroll listeners needed:

```typescript
html`<div #virtualScroll=${{
  items: this.allItems,    // full array
  itemHeight: 40,          // px per row
  containerHeight: 400,    // viewport px
  render: (item, i) => html`<div>${item.name}</div>`,
  overscan: 3,             // buffer rows
}}></div>`
```

The directive:
- Creates a scroll container with the specified height
- Adds a spacer div for the correct total scrollable height
- Renders only the visible items plus overscan buffer
- Updates on scroll via `requestAnimationFrame` (no reactive cycle needed)

### `computeVirtualSlice(config, scrollTop)`

Lower-level pure function for custom virtual scroll implementations:

```typescript
import { computeVirtualSlice } from '@miurajs/miura-render';

const vs = computeVirtualSlice({
  items: this.allItems,
  itemHeight: 40,
  containerHeight: 400,
  render: (item, i) => html`<div>${item.name}</div>`,
  overscan: 3,
}, this.scrollTop);

// Use vs.visibleItems, vs.totalHeight, vs.startIndex, etc.
```

## Structural Directives

Built-in directives that control DOM structure:

| Directive | Description |
|-----------|-------------|
| `#if` | Conditional rendering |
| `#for` | List iteration (callback mode or template mode with `{{$item}}`/`{{$index}}`) |
| `#switch` | Multi-case rendering |
| `#async` | Promise-driven pending/resolved/rejected rendering |
| `#virtualScroll` | Virtual scrolling for large lists |

Custom directives can be registered via `@directive` or `@lazyDirective` decorators. Lazy directives are only loaded when first used.

## Architecture

### Parser

A state-machine (`TemplateParser`) that walks template strings character by character, tracking context (text, tag, attribute name, attribute value, comment) to correctly identify binding positions. Outputs an HTML string with markers and a `TemplateBinding[]` array.

### Binding Manager

`BindingManager` creates binding instances from the parser output and initializes them with values. Each binding type implements the `Binding` interface:

```typescript
interface Binding {
  setValue(value: unknown, context?: unknown): void | Promise<void>;
  clear(): void;
  disconnect?(): void;
}
```

### Template Instance Reuse

When a `NodeBinding` receives a new `TemplateResult` with the same `strings` reference as the previous render, it calls `instance.update(newValues)` instead of tearing down and rebuilding the DOM.

### Keyed Diff (LIS Algorithm)

`KeyedListState` manages keyed list reconciliation:

1. Compute new keys, remove items with deleted keys
2. Reuse existing `TemplateInstance` objects for surviving keys
3. Build a position map (old index per key) and compute the **Longest Increasing Subsequence**
4. Items in the LIS stay in place; all others are moved via `insertBefore`

This is the same algorithm used by Vue and Svelte for list reconciliation.

## AOT Compiler

In addition to the default JIT rendering path, `miura-render` ships a `TemplateCompiler` that generates optimised `render()`/`update()` JS functions via `new Function()`. Component classes opt in with `static compiler = 'AOT' as const` on `MiuraElement`.

### How it works

```
Template string → TemplateParser → ParsedTemplate (HTML + TemplateBinding[])
                                          ↓
                                CodeFactory.generateRenderFunction()
                                CodeFactory.generateUpdateFunction()
                                          ↓
                                CompiledTemplate { render, update, nodeBindingIndices, directiveBindingInfos }
```

**First render** — `compiled.render(values)` clones the template, walks it once with `TreeWalker` to build a `refs[]` array (element/comment node refs indexed by binding marker), applies initial values, returns `{ fragment, refs }`.

**Subsequent updates** — `compiled.update(refs, values)` patches `refs[N].el.value`, `refs[N].el.setAttribute(…)` etc. **directly on cached refs** — zero DOM queries.

### Three-tier binding strategy

| Binding kind | Compiled code | External manager |
|---|---|---|
| Property / Boolean / Event / Class / Style / Spread / Bind / Async / Reference | ✅ Inlined in generated JS | — |
| **Node** (text, `TemplateResult`, `repeat()`) | — | `NodeBinding` instance per ref |
| **Directive** (`#if`, `#for`, `#switch`, custom) | — | `DirectiveBinding` instance per ref |

`CompiledTemplate` exposes `nodeBindingIndices` and `directiveBindingInfos` so the caller can wire up the correct instances after the initial DOM render.

AOT and JIT share the same parser and runtime binding semantics for complex
content. Node bindings, structural directives, `repeat()`, signals, and
`trustedHTML()` all keep the same behavior across both paths. Signal-like values
are unwrapped before generated code runs, and component-level direct property
reads can be promoted to fine-grained binding subscriptions by `MiuraElement`.

### Direct usage

```typescript
import { TemplateCompiler } from '@miurajs/miura-render';

const compiler = new TemplateCompiler();

// First call — parses + compiles (cached by strings reference)
const compiled = compiler.compile(result);

// First render
const { fragment, refs } = compiled.render(result.values);
shadowRoot.appendChild(fragment);

// Subsequent updates — zero DOM queries
compiled.update(refs, newResult.values);
```

## CSS Tagged Template

```typescript
import { css } from '@miurajs/miura-render';

const styles = css`
  :host { display: block; }
  .title { font-weight: bold; }
`;
```

Returns a `CSSResult` that can be applied to a shadow root via `adoptedStyleSheets` or a `<style>` element.

## Troubleshooting & Diagnostics

Miura provides detailed, searchable diagnostics to help you identify and fix binding issues quickly. All framework errors include a searchable index like `[binding:INDEX]` and descriptive context.

### Common Diagnostic Errors

| Error Message | Searchable Label | What Happened? | Solution |
| :--- | :--- | :--- | :--- |
| `Could not find marker comments (<!--binding:x-->)` | `[binding:9] text expression inside <textarea>` | The standard comment markers for `${...}` were swallowed as raw text by the browser (common in `textarea`, `style`, or `script`). | Use property binding `.value=${...}` instead of child interpolation, or rely on Miura's **Auto-Promotion** upgrade. |
| `Could not find element for [label]` | `[binding:0] event @click near "<button"` | The framework found the instruction in the template but the actual HTML element is missing from the DOM or was deleted. | Ensure the element is present at the time of update and hasn't been manually removed from the DOM. |
| `Could not find marker comments (<!--binding:x-->)` | `[binding:1] text expression near "<table>"` | A browser "hoisting" event occurred. Interpolation directly inside `<table>` or `<select>` is moved outside by the browser's parser. | Move the expression inside a valid child tag like `<tbody>`, `<tr>`, or `<td>`. |
| `Could not find marker comments (<!--binding:x-->)` | `[binding:2] directive #if near "<div>"` | A structural directive lost its boundary markers during a complex partial update. | Check for manual DOM manipulations that might have deleted the `<!--binding:x-->` comments. |

### How to Debug

1. **Check the DevTools Console**: Look for the specific `[binding:X]` index mentioned in the error.
2. **Inspect the DOM**: Search for `<!--binding:X-->` in the Elements panel. If it's missing or inside a literal text node, you've found the issue.
3. **Use the Miura Debugger**: If enabled, the draggable overlay provides a visual timeline and raw context for every failed update.

## License

MIT
