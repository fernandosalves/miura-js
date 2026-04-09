# Miura Roadmap

## Vision

Miura should feel like a complete framework for building applications with web components out of the box.

The long-term goal is not just component rendering. The goal is a framework with a strong default story for:

- reactive UI
- routing
- data and async state
- forms
- islands and server rendering
- plugins
- composition through slots
- performance through compiled rendering paths

Miura should make it easy to start small, but it should also feel opinionated and capable enough to support real applications without requiring a large amount of setup.

## Core Identity

Miura should be clearly recognizable through these characteristics:

- a web-component-first component model
- built-in application primitives, not only rendering primitives
- strong defaults for async UI and data flows
- first-class plugin architecture
- strong server and island support
- a clear path from simple templates to optimized compiled rendering

## What To Keep

These parts of the framework already form a strong foundation and should remain core:

- `MiuraElement` as the main component base
- `properties`, `state`, `computed`, and signals
- `template()` as the main rendering entrypoint
- structural directives
- dual JIT and AOT rendering paths
- islands and SSR-related capabilities
- package-based architecture for router, data flow, security, AI, and UI
- plugin-oriented framework APIs

## What To Simplify

The framework should keep reducing duplicate concepts and parallel syntax.

Priorities:

- prefer one obvious way to express common bindings
- unify overlapping binding behaviors where possible
- keep backwards compatibility for a transition period, then deprecate older aliases
- make template behavior predictable across JIT and AOT paths

Examples of this direction:

- unify plain `class` and `style` object support
- reduce specialized syntax where normal HTML-like bindings can carry the same meaning
- modernize or remove legacy examples and tests that no longer reflect the current API

## Signature Features For V1

These should define what makes Miura feel complete and distinctive:

### 1. Component Model

- `MiuraElement`
- reactive properties and state
- computed values
- signals for fine-grained updates
- slot-aware composition helpers

### 2. Resources

A first-class async resource model should become a major part of Miura.

This should cover:

- loading, success, and error states
- deduplication
- caching
- refresh and invalidation
- optional retry strategies
- server preload and island hydration integration

Ideal shape:

```ts
user = this.$resource(() => fetchUser(this.userId))
```

### 3. Forms

Miura should have a built-in form story instead of forcing every app to rebuild the same patterns.

This should cover:

- form state
- dirty/touched tracking
- validation
- async submission
- field binding helpers
- error presentation helpers

Ideal shape:

```ts
form = this.$form({
  title: '',
  body: ''
})
```

### 4. Islands And Server Rendering

Miura should make selective interactivity feel native and easy.

Priorities:

- strong island registration and rendering ergonomics
- preload data into interactive islands
- smooth handoff between server output and client activation
- predictable rules for when a component hydrates

### 5. Plugin System

The plugin system should become a defining framework feature.

Plugins should be able to extend:

- application lifecycle
- router setup
- data resources
- forms
- telemetry
- AI integrations
- security and policies

## Product Priorities

## Phase 1: Framework Stabilization

Goal: make rendering and reactivity fully reliable.

Focus:

- structural directive stability
- slot + conditional rendering stability
- repeated subtree stability
- parser and compiler consistency
- JIT/AOT behavior alignment
- stronger regression coverage for real application patterns

## Phase 2: Async Resource Model

Goal: give Miura a first-class story for data fetching and async UI.

Deliverables:

- `$resource`
- resource state helpers
- cache and invalidation
- async template helpers
- server preload integration

## Phase 3: Forms

Goal: make form-heavy applications a strength of the framework.

Deliverables:

- `$form`
- field state helpers
- validation primitives
- async submit lifecycle
- ergonomic template bindings

## Phase 4: Composition And Layout

Goal: make slots and component composition much stronger.

Deliverables:

- slot-presence directives
- slot-driven layout helpers
- headless UI building blocks
- stronger patterns for fallback content and conditional slot layouts

## Phase 5: Performance And Tooling

Goal: make Miura fast by default and easy to reason about when things change.

Deliverables:

- better AOT coverage
- subtree persistence where appropriate
- branch caching for structural directives
- debug output with strong template context
- update tracing tools
- compiler diagnostics

## API Directions To Explore

### Resources

```ts
class BlogEditor extends MiuraElement {
  post = this.$resource(() => fetchPost(this.postId))

  protected template() {
    return this.post.view({
      pending: () => html`<editor-skeleton />`,
      error: (error) => html`<error-box .error=${error} />`,
      ok: (post) => html`<post-editor .post=${post} />`
    })
  }
}
```

### Forms

```ts
class PostForm extends MiuraElement {
  form = this.$form({
    title: '',
    body: ''
  })

  protected template() {
    return html`
      <input .value=${this.form.fields.title.value} />
      <textarea .value=${this.form.fields.body.value}></textarea>
      <button ?disabled=${!this.form.valid}>Save</button>
    `
  }
}
```

### Shared App State

```ts
theme = this.$shared('theme', 'light')
sidebar = this.$shared('sidebarOpen', false)
```

### Slot-Aware Templates

```ts
protected template() {
  return html`
    <header #if=${this.hasSlot('header')}>
      <slot name="header"></slot>
    </header>

    <main>
      <slot></slot>
    </main>
  `
}
```

## Engineering Priorities

- keep JIT and AOT semantics aligned
- favor fewer special cases in the parser and binding system
- make directive behavior stable under repeated state transitions
- add regression tests for application-like templates, not only isolated units
- improve internal reuse so bindings and directives share more runtime logic
- keep runtime behavior predictable before adding more syntax

## Documentation Priorities

- present Miura as an application framework, not just a rendering package
- show recommended patterns, not every possible syntax equally
- document one canonical path for common work
- add guides for resources, forms, plugins, islands, and composition as they ship
- keep examples realistic: dashboards, blogs, admin panels, documentation sites, multi-step forms

## Near-Term Execution Plan

### Next

- continue hardening directive/reactivity behavior under repeated updates
- define the `resource` API
- define the `form` API
- simplify and document canonical binding usage

### Soon After

- extend island and SSR ergonomics
- introduce slot-aware directives and helpers
- improve AOT capabilities and diagnostics

### Later

- deeper devtools and inspection tooling
- plugin marketplace and official plugin catalog
- stronger framework conventions for large applications

## Decision Filter

When evaluating new features, Miura should ask:

- does this reduce setup for real applications?
- does this strengthen the framework identity?
- does this remove boilerplate or only add new syntax?
- does this work consistently across JIT and AOT?
- does this fit the web-component-first model cleanly?

If the answer is mostly no, the feature should probably wait.
