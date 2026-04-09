# `@miurajs/miura-debugger`

Miura's developer runtime for diagnostics, overlays, and in-page component layers.

## What It Does

- collects structured diagnostics across the framework
- mounts a development overlay for runtime errors and warnings
- tracks component layers for on-page inspection
- opens a lightweight component inspector from the in-page layer view
- records a framework timeline for renders, loads, submits, navigation, and plugin activity
- keeps internal details like `binding:0` available, while showing human-readable labels in the UI

## Quick Start

```typescript
import { enableMiuraDebugger } from '@miurajs/miura-debugger';

enableMiuraDebugger({
  overlay: true,
  layers: true,
  performance: true
});
```

`MiuraFramework` can also do this centrally in development through `static config.debugger`, so most apps do not need a separate bootstrap call.

## Diagnostics

Use `reportDiagnostic()` when a framework subsystem wants to emit structured developer-facing context:

```typescript
reportDiagnostic({
  subsystem: 'render',
  stage: 'binding',
  severity: 'error',
  message: 'Failed to create text expression for post.title',
  bindingLabel: 'text expression for post.title',
  bindingKind: 'text',
  templateFragment: '<h2>${post.title}</h2>'
});
```

Supported helpers:

- `reportDiagnostic(...)`
- `reportError(...)`
- `reportWarning(...)`
- `getDiagnostics()`
- `clearDiagnostics()`
- `subscribeDiagnostics(...)`
- `reportTimelineEvent(...)`
- `getTimelineEvents()`
- `clearTimelineEvents()`
- `subscribeTimeline(...)`

## Overlay And Layers

The debugger ships with a built-in `<miura-dev-overlay>` element. It is mounted automatically when `overlay: true`.

Layer helpers:

- `registerDebugLayer(...)`
- `unregisterDebugLayer(...)`
- `getDebugLayers()`
- `clearDebugLayers()`

These are used by `MiuraElement` to draw component borders and labels directly in the page when `layers: true`.

When the overlay and layers are both enabled, clicking a layer opens a simple inspector view with the component label, current snapshot values, render metrics, any registered framework primitives such as resources, forms, or route signals, and the recent timeline events associated with that component. That makes it easier to understand what a component looked like and what it just did, even when there is no active runtime error.

## Component-Level Debug Options

Components can refine how they appear in the debugger with either `static debug` or the `@debug(...)` decorator:

```typescript
import { MiuraElement, debug } from '@miurajs/miura-element';

@debug({
  label: 'BlogEditor',
  color: '12, 145, 255',
  showRenderTime: true
})
class BlogEditor extends MiuraElement {
  static debug = {
    report: true,
    layers: true
  };
}
```

That gives you custom layer labels, per-component opt-outs, and a clear place to grow future debug features without turning the whole app into a global toggle soup.

When using the umbrella `@miurajs/miura` package, the runtime logger is exported as `debugLogger` so it does not collide with the component decorator.

## Framework Integration

`MiuraFramework` can enable the debugger centrally from `static config` in development:

```typescript
static config = {
  environment: 'development',
  debug: true,
  performance: true,
  debugger: {
    overlay: true,
    layers: true,
    performance: true
  }
};
```

Keep it disabled in production builds.
