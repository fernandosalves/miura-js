# Miura State Primitives

This document defines the next state and communication primitives for `@miurajs/miura-element`.

The goal is a small set of APIs that feel obvious to developers:

- `@signal` for local retained fine-grained state
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
| `@signal` | State | Local | Yes | N/A |
| `@global` | State | Global | Yes | N/A |
| `@beacon` | Event | Global | No | Yes |
| `@pulse` | Event | Global | No | No |
| `@consume` | Context | Tree-scoped | Provider-defined | Provider-defined |

## `@signal`

`@signal` is the decorator-facing form of local signal-backed state.

Intended semantics:

- local to one component instance
- retained value
- plain property read/write syntax
- should update only bindings that consume it
- should not trigger a full component rerender

Near-term implementation direction:

- keep `createSignal()` / `createComputed()` as the public low-level primitives
- add decorator metadata and runtime support incrementally
- avoid changing current `@state()` semantics until the fine-grained path is complete
- current runtime support exposes stable field refs through `this.$.fieldName`, `this.$ref(name)`, `this.$signalRef(name)`, and `this.$globalRef(name)` for direct fine-grained bindings
- field refs are signal-like objects, so they can be passed directly to templates and also expose `.value`, `.peek()`, `.subscribe()`, and `.map(...)`
- future work can make plain `this.field` reads compiler-aware without changing the field API

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

1. Land the channel primitives and framework-native helpers.
2. Add decorator metadata and registry plumbing for `@global`, `@beacon`, and `@pulse`.
3. Add `@signal` with a true fine-grained local field path.
4. Align docs, tests, and examples once semantics are fully stable.
