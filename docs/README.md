# miura: A Modular Framework

miura is a comprehensive, modular framework designed for building scalable and maintainable web applications. The framework is organized into a monorepo, with each package addressing a specific concern.

## Documentation

### Core

- **[miura Element](../packages/miura-element/README.md)**: Base class for reactive web components — properties, lifecycle hooks, error boundaries, two-way binding, slot utilities.
- **[miura Render](../packages/miura-render/README.md)**: Rendering engine — `html`/`css` templates, state-machine parser, 10 binding types, LIS-based keyed diff, async rendering, virtual scrolling.
- **[miura Framework](./miura-framework.md)**: Orchestration layer — plugin manager, event bus, performance monitor.

### Data & Routing

- **[miura Data Flow](./miura-data-flow.md)**: State management — store, middleware, 9 data providers (REST, GraphQL, Firebase, Supabase, S3, WebSocket, gRPC, LocalStorage, IndexedDB).
- **[miura Router](./miura-router.md)**: Client-side routing.

### UI & Dev Tools

- **[miura UI](./miura-ui.md)**: 70+ pre-built UI components (primitives, navigation, overlay, data-display, layout, typography).
- **[miura Debugger](./miura-debugger.md)**: Category/level logger for development.
- **[miura Security](./miura-security.md)**: Auth, AuthZ, CSP, input validation.

### New Packages

- **[miura i18n](../packages/miura-i18n/README.md)**: Internationalization — `t()`, dot-notation keys, pluralization, interpolation, fallback locale.
- **[miura Computing](../packages/miura-computing/README.md)**: Reactive Web Worker bridge — `WorkerBridge`, `expose()`, typed `call()`/`stream()` protocol.

### Reference Docs

- **[Rendering (JIT & AOT)](./miura-render.md)**: Full binding reference, structural directives, JIT vs AOT compiler.
- **[Router](./miura-router.md)**: Guards, loaders, nested routes, layout outlets, router API.
- **[Framework Overview](./miura.md)**: Package index, key concepts, lifecycle diagram.

### Coming Soon

- **[miura Graphics](./miura-graphics.md)**: 2D/3D rendering and animations.
- **[miura AI](../packages/miura-ai/README.md)**: `#stream` directive — progressive token rendering from SSE/WebSocket/ReadableStream.
