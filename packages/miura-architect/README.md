# @miurajs/miura-architect

Architecture-first developer tools for the Miura framework.

## Overview

Miura Architect is a next-generation developer tool designed to visualize and debug Miura applications. Unlike traditional debuggers that focus solely on state timelines, Architect prioritizes the **application architecture**, providing a spatial "Visual Brain Map" of your components, data flows, and dependencies.

## Key Features

- **Architecture Graph**: A spatial visualization of your component hierarchy.
- **Data Flow Mapping**: See how signals, stores, and contexts connect across your application.
- **Real-time Synchronization**: Live updates as your application state changes.
- **Manifest Integration**: Merge static build-time metadata with runtime snapshots for a complete architectural view.
- **Spatial Navigation**: Pan, zoom, and focus on specific areas of your application graph.

## Documentation

- [Overview](./docs/OVERVIEW.md)
- [Getting Started](./docs/GETTING_STARTED.md)
- [API Specification](./docs/API_SPECIFICATION.md)
- [Types and Structures](./docs/CORE_TYPES.md)

## Installation

```bash
npm install @miurajs/miura-architect
```

## Quick Start

1. **Install the Vite plugin**: Use `@miurajs/miura-vite` to enable manifest generation in your project.
2. **Launch the Architect Server**:
   ```bash
   npx miura-architect server
   ```
3. **Open the Architect UI**: Navigate to `http://localhost:3005` to start visualizing your app.

## License

MIT
