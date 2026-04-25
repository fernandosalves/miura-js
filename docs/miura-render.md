# miura Render

> Full package README: [`packages/miura-render/README.md`](../packages/miura-render/README.md)

`@miurajs/miura-render` is the rendering engine for the miura framework. It provides the `html`/`css` tagged template literals, a state-machine parser, a binding manager, structural directives, and both JIT and AOT rendering paths.

---

## Binding Reference

| Prefix | Type | Example | Notes |
|--------|------|---------|-------|
| *(none)* | Node | `${this.text}` | Text, `TemplateResult`, `RepeatResult`, arrays |
| `@` | Event | `@click=${this.handler}` | Modifiers: `\|prevent`, `\|stop`, `\|once` |
| `.` | Property | `.value=${this.text}` | Sets DOM property directly |
| `?` | Boolean | `?disabled=${this.off}` | `setAttribute` / `removeAttribute` |
| `&` | Two-way | `&value=${this.bind('x')}` | Property set + event listener |
| `class` | Class map | `class=${{ active: true }}` | Object map or string |
| `style` | Style map | `style=${{ color: 'red' }}` | Object map or string |
| `...` | Spread | `...=${propsObj}` | `Object.assign(el, propsObj)` |
| `~` | Async | `~src=${promise}` | Auto-unwraps Promise/Observable |
| `#` | Directive / Ref | `#if=${cond}`, `#ref=${el}` | Structural directives or element refs |

Node bindings are the preferred place for dynamic content subtrees. Use property
bindings for DOM properties like `.value`, `.checked`, or `.scrollTop`; use
node bindings for content. Avoid `.innerHTML=${...}` for rendered content,
because it hides a subtree behind a generic property write.

### Event Modifiers

```typescript
@submit|prevent=${handler}         // preventDefault
@click|stop=${handler}             // stopPropagation
@click|prevent,stop=${handler}     // both
@click|prevent|stop=${handler}     // also supported
@click|once=${handler}             // { once: true }
```

### Multi-expression attributes

```typescript
html`<div title="Hello ${first} ${last}">...</div>`
// → concatenated as a single Attribute binding
```

### Trusted HTML

`trustedHTML(value, options?)` marks a string as a trusted subtree:

```typescript
import { html, trustedHTML } from '@miurajs/miura-render';

html`
  <article class="content">
    ${trustedHTML(cleanHtml, {
      afterRender(root) {
        renderMermaidDiagrams(root);
        mountCodeSandboxes(root);
      }
    })}
  </article>
`
```

Use it for HTML that your app has already sanitized or generated itself, such as
markdown output after DOMPurify, server-rendered fragments, or framework-owned
SVG children. Miura does not sanitize this value.

`afterRender(root)` runs after Miura inserts the trusted subtree. In JIT it is
called by `NodeBinding`; in AOT it is called by the compiled node-binding helper.
When the value comes from a direct signal-backed property read, Miura preserves
fine-grained updates and reruns the trusted subtree render without forcing the
component template to rerender.

`trustHTML()` remains available as a compatibility alias, but `trustedHTML()` is
the preferred name for new code.

---

## Functional Directives

### `when(condition, trueCase, falseCase?)`
Conditional rendering — only the active branch renders.

### `choose(value, cases[], default?)`
Multi-branch switch expression.

### `repeat(items, keyFn, templateFn)`
Keyed list using LIS-based diffing (O(n log n)). Minimal DOM moves on reorder.

```typescript
${repeat(this.items, i => i.id, i => html`<li>${i.name}</li>`)}
```

### `resolveAsync(tracker, resolved, pending?, rejected?)`
Declarative promise rendering. Pair with `createAsyncTracker()`.

### `computeVirtualSlice(config, scrollTop)`
Lower-level virtual-scroll helper that returns `{ visibleItems, totalHeight, startIndex, … }`.

---

## Structural Directives

| Directive | Description |
|-----------|-------------|
| `#if` | Show/hide based on boolean expression |
| `#else` | Sibling of `#if` — shown when condition is false |
| `#elseif` | Chained condition |
| `#for` | Iterate array (callback mode or `<template>` + `{{$item}}`/`{{$index}}`) |
| `#switch` + `#case` | Multi-branch with `<template case="value">` children |
| `#async` | Promise-driven `<template pending/resolved/rejected>` |
| `#virtualScroll` | Virtual scrolling — manages scroll container, spacer, visible slice |

Custom directives are registered with `@directive` (eager) or `@lazyDirective` (loaded on first use).

---

## JIT vs AOT Rendering

### JIT (default)

Every component uses the `TemplateProcessor` pipeline:

1. `TemplateParser` parses the `html` literal → `ParsedTemplate` (HTML string + `TemplateBinding[]`)
2. Fragment created, `BindingManager.createAndInitializeParts()` builds `Binding` instances
3. On update: `instance.update(values)` calls `setValue()` on each binding

Supports all binding types including signals, directives, and async rendering.

### AOT

Opt in with `static compiler = 'AOT' as const` on a `MiuraElement` subclass:

1. `TemplateCompiler.compile(result)` → `CompiledTemplate` (cached by `strings` reference)
2. `compiled.render(values)` — clones HTML, walks DOM once, builds `refs[]`, returns `{ fragment, refs }`
3. `compiled.update(refs, values)` — patches `refs[N].el.prop = v` **directly** — zero DOM queries

Three-tier binding strategy:

| Kind | Handler |
|---|---|
| Property / Boolean / Event / Class / Style / etc. | Generated JS (inlined in `new Function()`) |
| Node (TemplateResult, `repeat()`) | `NodeBinding` instance per ref |
| Directive (`#if`, `#for`, `#switch`) | `DirectiveBinding` instance per ref |

AOT uses the same parsed-template cache shape as JIT and delegates complex
content back to the runtime binding classes where needed. That keeps features
like `repeat()`, nested templates, structural directives, signals, and
`trustedHTML()` aligned between both renderers.

Signal-like values passed into AOT templates are unwrapped before generated code
runs, and direct template reads from signal-backed properties can be promoted to
binding-level subscriptions. The practical effect is that simple AOT bindings
can update directly from a signal notification without a full component render.

`CompiledTemplate` fields:
- `html` — the parsed HTML string
- `nodeBindingIndices` — which refs need `NodeBinding`
- `directiveBindingInfos` — `{ refIndex, name }[]` for directive refs
- `render(values)` → `{ fragment, refs }`
- `update(refs, values)` → `void`

---

## Architecture

```
html`...`  →  TemplateResult { strings, values }
                    │
              TemplateParser               (state-machine, one pass)
                    │
              ParsedTemplate { html, bindings[] }
                    │
         ┌──────────┴──────────┐
         │ JIT                 │ AOT
   BindingManager         CodeFactory
   (Binding instances)    (new Function())
         │                     │
   TemplateInstance       CompiledTemplate
   .update(values)        .update(refs, values)
```
