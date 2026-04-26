# Miura Flow: The Architect's Command Center

This document outlines the strategic vision for the Miura DevTools (Miura Flow), designed to provide a premium, out-of-the-box developer experience.

## 1. The Core Pillar: Blueprint Node Graph
*The "Satellite View" of your architecture.*

- **Static vs. Dynamic Toggle**: Switch between the "Code Blueprint" (all registered components and signals) and the "Live DOM Tree" (actually mounted instances).
- **Subcomponent Nesting**: Visual grouping of components based on template hierarchy rather than just flat DOM structure.
- **Dependency Lines**: Real-time "pulse" animations when a signal updates, showing the flow from state to the observing components.
- **Routing Points**: Explicit visualization of `router-outlet` nodes and their currently active routes.

## 2. The Logic Pillar: Precise Session Recorder
*The "Black Box" flight recorder.*

- **Causal Grouping (Traces)**: Group events by their origin (e.g., "User Click -> Action -> Signal -> Render"). All events share a unique `correlationId`.
- **Micro-Timestamps**: High-precision timing showing the latency between state change and DOM reconciliation.
- **Data Flow Diffing**: Visual comparison of signal values before and after a transaction.

## 3. Premium DX Features

### A. State Time-Travel & Snapshotting ⏳
- **Rewind/Replay**: A timeline slider to revert signals to previous values.
- **State Hot-Swap**: Directly modify component signals/props from the panel.
- **Scenario Save**: Export/Import state snapshots for bug reproduction.

### B. Signal "Causality" Inspector 🧬
- **Reverse-Trace**: Identify why a signal changed (e.g., which `computed` dependency or user action triggered it).
- **Leak Detection**: Highlight signals that are being updated but have no active observers.

### C. Performance Heatmaps (AOT vs JIT) ⚡
- **AOT Visualizer**: Highlight components optimized via the Miura AOT compiler.
- **Render Hotspots**: Components that exceed the 16ms frame budget or re-render excessively glow red.

### D. "Islands" & Hydration Inspector 🏝️
- **Hydration Status**: Visually distinguish between static SSR content and hydrated reactive islands.
- **Props Bridge**: Inspect data passed from Server to Client for hydration.

### E. Event Beacon & Pulse Monitor 📡
- **Channel Activity**: Dedicated view for `Beacons` and `Pulses` showing message flow across the application bus.

## 4. Implementation Strategy

### Module Hook Points
- **`miura-element`**: Active rendering stack and event-trace initialization.
- **`miura-render`**: `BindingManager` interception for DOM update reporting.
- **`miura-router`**: Navigation start traces and route manifest export.
- **`miura-data-flow`**: Store action and global signal tracking.
- **`miura-debugger`**: Central hub for `TraceContext` and data aggregation.
