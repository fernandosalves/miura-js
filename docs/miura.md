# miura Framework

`@miurajs/miura` is the meta-package that re-exports everything from every framework package. Import from here when you want a single entry-point.

```typescript
import {
  MiuraElement, html, css, component,
  repeat, when, choose, resolveAsync, createAsyncTracker,
  TemplateCompiler,
  $signal, $computed,
} from '@miurajs/miura';
```

---

## Package Overview

| Package | Role | Status |
|---------|------|--------|
| `@miurajs/miura-element` | Base class, reactive properties, lifecycle, AOT/JIT compiler flag | ✅ Stable |
| `@miurajs/miura-render` | `html`/`css` templates, parser, bindings, directives, AOT `CodeFactory` | ✅ Stable |
| `@miurajs/miura-framework` | Orchestration — plugin manager, event bus, performance monitor | ✅ Stable |
| `@miurajs/miura-data-flow` | Store, middleware, 9 data providers | ✅ Stable |
| `@miurajs/miura-ui` | 70+ pre-built UI components | ✅ Stable |
| `@miurajs/miura-router` | Client-side routing, guards, loaders, nested routes | ✅ Stable |
| `@miurajs/miura-security` | Auth, AuthZ, CSP, input validation | ✅ Stable |
| `@miurajs/miura-debugger` | Category/level logger | ✅ Stable |
| `@miurajs/miura-i18n` | Internationalization — `t()`, plurals, interpolation, fallback locale | ✅ Skeleton |
| `@miurajs/miura-computing` | Reactive Web Worker bridge — `WorkerBridge`, `expose()` | ✅ Skeleton |
| `@miurajs/miura-ai` | `#stream` directive for progressive token rendering | 🔨 Planned |
| `@miurajs/miura-graphics` | 2D/3D rendering | 🔨 Planned |

---

## Key Concepts

### Component Lifecycle

```
constructor → connectedCallback → onMount() → [updates] → onUnmount() → disconnectedCallback
```

Reactive property change:
```
property.set(value) → signal.notify() → requestUpdate() → willUpdate() → shouldUpdate()?
                    → performUpdate() → renderTemplateInstance() → updated()
```

### JIT vs AOT

All components default to **JIT** rendering via `TemplateProcessor`. Opt into **AOT** per class:

```typescript
static compiler = 'AOT' as const;
```

See [`docs/miura-render.md`](./miura-render.md) for the full breakdown.

### Signal-Backed Properties

Every `static properties` field is backed by a `Signal`. Setting `this.foo = value` calls `signal.set(value)` which notifies all subscribers. `BindingManager` subscribes to signal values directly, enabling sub-render-cycle updates for simple bindings.

### Routing

Use `createRouter()` from `@miurajs/miura-router`. Define a `render` callback that mounts the matched component. See [`docs/miura-router.md`](./miura-router.md).

### i18n

Use `miuraI18n.load(locale, dict)` to register translations, `I18nMixin(MiuraElement)` to add `this.t()` to a component. See [`packages/miura-i18n/README.md`](../packages/miura-i18n/README.md).

### Web Workers

Use `WorkerBridge` (main thread) + `expose()` (worker). See [`packages/miura-computing/README.md`](../packages/miura-computing/README.md).

---

## Further Reading

- [Binding reference → `docs/miura-render.md`](./miura-render.md)
- [Router reference → `docs/miura-router.md`](./miura-router.md)
- [Component API → `packages/miura-element/README.md`](../packages/miura-element/README.md)
- [Roadmap → `miura_ROADMAP.md`](../miura_ROADMAP.md)