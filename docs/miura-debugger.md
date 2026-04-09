# miura Debugger

`@miurajs/miura-debugger` is Miura's shared diagnostics runtime.

It powers:

- structured framework diagnostics
- the in-page development overlay
- component layer highlights
- performance labels for rendered components
- focused error rectangles for the active diagnostic
- a lightweight component inspector reachable from layer clicks
- a recent-event timeline for framework activity

## Enable It

```typescript
import { enableMiuraDebugger } from '@miurajs/miura-debugger';

enableMiuraDebugger({
  overlay: true,
  layers: true,
  performance: true
});
```

If you are building on `MiuraFramework`, the framework can own this setup through `static config.debugger` in development, so you do not need a separate bootstrap call.

## Why It Matters

The debugger keeps low-level compiler details available internally while presenting human-readable labels to developers.

Example:

- internal: `bindingIndex: 0`
- user-facing: `text expression for post.title`

This makes runtime failures much easier to understand than raw marker names.

## Current Features

- diagnostics store with subscriptions
- error and warning reporting helpers
- timeline event store with subscriptions
- draggable development overlay
- component layer view with labels
- layer click inspection for component values, metrics, and framework primitives like resources/forms/routes
- recent timeline entries for renders, navigation, resource loads, form submits, and plugin activity
- component-level debug customization with `static debug` or `@debug(...)`
- framework integrations for:
  - `miura-element`
  - `miura-render`
  - `miura-router`
  - `miura-framework`

## Planned Direction

- property- and method-level `@debug(...)`
- richer call stack formatting
- template/source highlighting
- resource, form, router, and island timelines
- click-to-inspect component state
