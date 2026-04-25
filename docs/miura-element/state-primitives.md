# Miura State Primitives

This document defines the current state and communication primitives for `@miurajs/miura-element`, plus the decorator-facing names they are growing toward.

The goal is a small set of APIs that feel obvious to developers:

- signal-backed component properties for retained fine-grained state
- `@global` for app-wide retained fine-grained state
- `@beacon` for app-wide typed events with payload
- `@pulse` for app-wide void events
- `@consume` for hierarchical tree-scoped context

## Mental Model

Choose the primitive by answering two questions:

1. Is this state or an event?
2. Is it local, global, or tree-scoped?

| Primitive | Kind | Scope | Retained | Payload |
| --- | --- | --- | --- | --- |
| `static properties` / `@property` | State | Local component instance | Yes | N/A |
| field refs (`this.$.name`) | State ref | Local component instance | Yes | N/A |
| `@global` | State | Global | Yes | N/A |
| `@beacon` | Event | Global | No | Yes |
| `@pulse` | Event | Global | No | No |
| `@consume` | Context | Tree-scoped | Provider-defined | Provider-defined |

## Local Signal-Backed Properties

Miura component properties are signal-backed. You can define them with
`static properties` or with the `@property()` decorator:

```typescript
@component({ tag: 'status-pill' })
class StatusPill extends MiuraElement {
  @property({ type: String, default: 'idle' })
  status!: string;

  template() {
    return html`<span>${this.status}</span>`;
  }
}
```

Current semantics:

- local to one component instance
- retained value
- plain property read/write syntax
- direct template reads can update only the bindings that consume them
- transformed reads still rerender the component, preserving predictable behavior

The fine-grained path applies when Miura can match a template expression to a
single direct property read:

```typescript
html`<span>${this.status}</span>`       // fine-grained candidate
html`<span>${this.status.toUpperCase()}</span>` // full rerender
```

Runtime support also exposes stable field refs through `this.$.fieldName`,
`this.$ref(name)`, `this.$signalRef(name)`, and `this.$globalRef(name)` for
explicit direct bindings. Field refs are signal-like objects, so they can be
passed directly to templates and expose `.value`, `.peek()`, `.subscribe()`,
and `.map(...)`.

Fine-grained direct reads work across JIT and AOT render paths, including
trusted HTML subtrees created with `trustedHTML(this.renderedHtml)`.

## `@global`

`@global` is the decorator-facing form of shared keyed state.

Intended semantics:

- app-wide retained value
- plain property read/write syntax
- backed by the shared signal registry
- multiple components using the same key read and write the same state

Current low-level foundation:

- `shared()` / `$shared()` remain the retained shared-state primitive

## `@beacon`

`@beacon` is a global event channel with payload.

Intended semantics:

- event, not state
- no retained value by default
- used for notifications, commands, broadcasts, and one-time messages
- can be consumed by explicit handlers or later by decorator bindings

Examples of intent:

- navigation requests
- toast requests
- telemetry events
- workflow notifications

## `@pulse`

`@pulse` is a global event channel without payload.

Intended semantics:

- fire-and-forget event
- no retained value
- optimized mental model for simple notifications

Examples of intent:

- refresh request
- dismiss-all request
- focus-current request

## `@consume`

`@consume` is hierarchical context.

Important distinction:

- `@global` is app-wide shared state
- `@consume` is tree-scoped shared state

Context depends on the nearest ancestor provider in the DOM or shadow tree. That makes it ideal for multiple independent widget instances on the same page, where each subtree needs isolated shared state.

## Low-Level Runtime Foundations

The runtime should expose a stable low-level layer that decorators can build on:

- `createSignal()` and `createComputed()`
- `shared()`
- `createBeacon()`
- `createPulse()`
- `this.$emit(channel, payload?)`
- `this.$on(channel, handler)`
- `this.$once(channel, handler)`

Decorator support should be layered on top of those primitives rather than introducing unrelated hidden mechanisms.

## Implementation Plan

1. Keep signal-backed `static properties` / `@property()` as the stable local state path.
2. Keep direct template-read promotion and field refs as the stable fine-grained runtime path.
3. Layer decorator-facing aliases like `@global`, `@beacon`, `@pulse`, and `@consume` over the existing runtime primitives.
4. Consider a future `@signal` alias only if it adds clarity beyond `@property()` / `@state()` and field refs.
