# Miura Roadmap Tasks

This document turns the high-level roadmap into implementation work grouped by package.

It is intentionally practical:

- what package owns the work
- what the immediate tasks are
- what can ship early
- what depends on other packages

## Priority Bands

### P0

Must-have work for framework reliability and API clarity.

### P1

High-value framework features that define the developer experience.

### P2

Important polish, performance, and ecosystem work that strengthens the platform.

## Cross-Package Milestones

## Milestone 1: Rendering And Reactivity Stability

Packages:

- `miura-render`
- `miura-element`
- `miura-framework`
- `miura-debugger`

Goals:

- structural directives remain stable under repeated reactive updates
- parser, JIT, and AOT semantics stay aligned
- repeated and slotted subtrees survive reorder/shrink/grow cycles
- debug output helps explain update behavior

## Milestone 2: Resource Model

Packages:

- `miura-element`
- `miura-data-flow`
- `miura-framework`
- `miura-router`
- `miura-vite`

Goals:

- first-class `$resource`
- cache and invalidation
- route-aware data loading
- preload support for islands/server output

## Milestone 3: Form System

Packages:

- `miura-element`
- `miura-data-flow`
- `miura-ui`
- `miura-security`

Goals:

- first-class `$form`
- field state and validation
- secure submission flows
- reusable UI field primitives

## Milestone 4: Composition And Slots

Packages:

- `miura-element`
- `miura-render`
- `miura-ui`

Goals:

- slot-aware directives
- fallback and presence-aware composition
- headless UI primitives driven by slots

## Milestone 5: Tooling And Ecosystem

Packages:

- `miura-debugger`
- `miura-vite`
- `miura-framework`
- `miura`

Goals:

- stronger diagnostics
- better dev/build ergonomics
- cleaner public package story

## Package Task Breakdown

## `packages/miura-render`

### P0

- Keep unifying binding behavior so common HTML bindings are the canonical path.
- Add more regression coverage for directive interactions with nested templates.
- Add regression coverage for branch persistence across repeated toggles.
- Audit parser output so JIT and AOT consume the same semantics.
- Reduce edge-case drift between single-expression and multipart attribute handling.
- Add stronger tests for `#if`, `#for`, `#switch`, `#async`, `repeat()`, slots, and nested repeated content.

### P1

- Design optional branch caching for structural directives.
- Add subtree persistence options for inactive `#if` / `#switch` branches.
- Improve keyed reuse for complex nested repeated content.
- Expand AOT support for more directive and binding combinations.
- Add canonical support for slot-aware rendering helpers.

### P2

- Simplify legacy binding enum paths after deprecation periods end.
- Reduce duplicate runtime logic between JIT bindings and compiled helpers.
- Benchmark parser and binding-manager hot paths under realistic app templates.
- Document the supported canonical syntax in one place.

## `packages/miura-element`

### P0

- Continue hardening `updateComplete`, async update batching, and directive interaction behavior.
- Design a first-class `$resource` API shape.
- Design a first-class `$form` API shape.
- Strengthen slot composition helpers and slot lifecycle behavior.
- Add more real-world component tests for blog/docs/admin-like templates.

### P1

- Implement `$resource`.
- Implement `$form`.
- Add shared/app state helpers such as `$shared`.
- Add slot-aware directives or element-level composition helpers.
- Add component-level persistence helpers for expensive branches and views.

### P2

- Add ergonomics for headless state patterns.
- Add richer lifecycle tracing hooks for debugging.
- Improve SSR/island-facing component APIs where server/client boundaries matter.

## `packages/miura-framework`

### P0

- Define how resources integrate with framework lifecycle and plugins.
- Define how global state, router data, and resources connect.
- Keep lifecycle and plugin APIs stable while component/data features evolve.

### P1

- Add framework-level resource registry and invalidation hooks.
- Add route-level loader conventions that feed directly into resources.
- Add plugin extension points for resources, forms, telemetry, and policies.
- Add application configuration conventions for SSR/islands/data preload.

### P2

- Add optional framework presets for common app types.
- Add stronger project scaffolding conventions.
- Add official plugin catalog patterns.

## `packages/miura-data-flow`

### P0

- Define the cache and subscription model needed by `$resource`.
- Add invalidation and refresh primitives that can be used outside components too.
- Clarify the split between local component state and shared data-flow state.

### P1

- Build query/resource cache primitives.
- Add stale-while-revalidate and retry helpers.
- Add request deduplication and cache-key conventions.
- Add preload/rehydration primitives for server-rendered payloads.

### P2

- Add optional persistence strategies.
- Add developer-facing inspection helpers for cache state.

## `packages/miura-router`

### P0

- Define route loader integration with future resources.
- Make route navigation and data loading feel like one system.

### P1

- Add route resource preload helpers.
- Add invalidation hooks on route changes.
- Add better typed route-data patterns.

### P2

- Add streaming/deferred route data patterns if they fit the server model.

## `packages/miura-ui`

### P0

- Decide how much of the form experience should land here versus in `miura-element`.
- Build primitives that prove the slot/composition story.

### P1

- Add form field primitives built for `$form`.
- Add headless UI primitives using slots and state helpers.
- Add application-level examples: blog editor, dashboard shell, settings pages.

### P2

- Add a design-token story that aligns with framework utilities and themes.

## `packages/miura-vite`

### P0

- Keep test/build resolution aligned with workspace source packages.
- Improve the build story around islands and framework package integration.

### P1

- Add resource preload serialization support if needed for SSR/islands.
- Add framework-aware dev warnings for unsupported SSR/hydration patterns.

### P2

- Add build analysis helpers for AOT usage and hydration boundaries.

## `packages/miura-debugger`

### P0

- Improve debug output around rendering, bindings, and directive transitions.
- Add stronger context for failures in template parsing and binding initialization.

### P1

- Add update tracing: what changed, what rerendered, what directive switched.
- Add performance hooks for render/update timings.

### P2

- Add a visual devtools bridge or debug panel integration.

## `packages/miura-security`

### P1

- Define how form validation and submission policy hooks connect to security.
- Add safe defaults for async submission and credential-sensitive actions.

### P2

- Add plugin-level policy integrations for auth, permissions, and action guards.

## `packages/miura-i18n`

### P1

- Ensure resources and forms can integrate with locale-sensitive formatting and validation.
- Define good translation patterns for component templates and UI primitives.

### P2

- Add route-aware locale preload patterns if needed.

## `packages/miura-ai`

### P2

- Define plugin-friendly AI workflows rather than tightly coupling them into core rendering.
- Focus on useful app-level integrations: content generation, assistants, summaries, workflow actions.

## `packages/miura`

### P0

- Keep the top-level package exports opinionated and clean.
- Re-export only the APIs that represent the recommended path.

### P1

- Make the top-level package the easiest way to adopt the “full framework” story.
- Keep docs/examples aligned with the top-level public API.

## Suggested Issue Backlog

These are good candidates for immediate tracked issues.

### P0 Issues

- `miura-render`: add structural directive branch persistence regression matrix
- `miura-render`: align JIT and AOT semantics for all canonical bindings
- `miura-element`: design `$resource` API
- `miura-element`: design `$form` API
- `miura-element`: add slot-aware directive integration tests
- `miura-debugger`: improve binding and directive error context

### P1 Issues

- `miura-data-flow`: implement resource cache primitives
- `miura-element`: implement `$resource`
- `miura-element`: implement `$form`
- `miura-framework`: integrate route loaders with resources
- `miura-ui`: build form primitives on top of `$form`
- `miura-render`: prototype cached `#if` / `#switch` branches

### P2 Issues

- `miura-vite`: add hydration/build diagnostics
- `miura-debugger`: add update tracing
- `miura-framework`: define preset/plugin catalog strategy
- `miura-ui`: expand headless slot-driven primitives

## Recommended Execution Order

1. Finish stabilization and directive/render regression work.
2. Lock down the canonical binding and template model.
3. Design and ship `$resource`.
4. Design and ship `$form`.
5. Integrate resources with router and framework lifecycle.
6. Expand slot-aware composition and headless UI primitives.
7. Improve diagnostics, tracing, and performance tooling.

## Definition Of Done For The Next Major Phase

The next major phase should be considered complete when:

- rendering and reactivity regressions have broad coverage
- resources are first-class and documented
- forms are first-class and documented
- framework/router/data packages work together with a clear default path
- examples reflect realistic application composition
- the top-level package tells one coherent story
