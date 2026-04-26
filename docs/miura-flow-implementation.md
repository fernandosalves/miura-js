# Miura DevTools Implementation Plan (Technical)

This document details the specific technical hooks and triggers required across the Miura monorepo to support Miura Flow.

## 1. `miura-debugger` (The Backbone)
The central registry for all devtools data.

- [ ] **Trace Engine**: Implement a global `TraceContext` manager to track `correlationId`.
- [ ] **Bridge Protocol**: Define a WebSocket schema for:
    - `COMPONENT_DISCOVERED`
    - `SIGNAL_CREATED` / `SIGNAL_UPDATED`
    - `TRACE_STARTED` / `TRACE_ENDED`
    - `DOM_PATCHED`
    - `ROUTE_MANIFEST`

## 2. `miura-element` (The Trigger)
- [ ] **Active Component Stack**: Implement `pushActiveComponent(instance)` / `popActiveComponent()` in the `performUpdate` loop.
- [ ] **Interaction Wrapper**: Start a new trace in the `handleEvent` or event binding logic.
- [ ] **Blueprint Export**: Add a static method to export the `ComponentDefinition` (props, signals, globals).

## 3. `miura-render` (The Visualizer)
- [ ] **Binding Hooks**: In `BindingManager.setValue()`, if `debugger.enabled`, report the update:
    ```typescript
    reportTimelineEvent({
        subsystem: 'render',
        stage: 'binding',
        message: `Updated ${binding.name}`,
        values: { newValue, oldValue, traceId: currentTraceId }
    });
    ```
- [ ] **Tree Discovery**: In `TemplateProcessor.createInstance()`, report the relationship between the `context` (parent) and the new `TemplateInstance`.

## 4. `miura-router` (The Navigator)
- [ ] **Manifest**: On `new MiuraRouter()`, emit the full `compiledRoutes` to the bridge.
- [ ] **Navigation Trace**: Start a new trace on `handleNavigation` and end it on `updated`.

## 5. `miura-data-flow` (The State)
- [ ] **Store Hooks**: Add middleware to report every `dispatch` and `setState` operation.
- [ ] **Global Registry**: Expose all signals in `GlobalStateManager` to the debugger.

## 6. Communication Bridge (`miura-devtools`)
- [ ] **WebSocket Server**: Upgrade the basic bridge to handle bidirectional communication (for state hot-swapping).
- [ ] **UI Graph Engine**: Implement a force-directed graph to handle dynamic component/signal nodes.
