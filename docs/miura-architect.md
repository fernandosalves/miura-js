# miura Architect

`@miurajs/miura-architect` is an architecture-first developer tool designed to visualize and debug Miura applications. It provides a spatial "Visual Brain Map" of your components, data flows, and dependencies.

## Features

- **Architecture Graph**: Spatial visualization of component hierarchy and relationships.
- **Data Flow Mapping**: Visualize signals, stores, and contexts across the application.
- **Real-time Sync**: Live updates as application state changes.
- **Spatial Navigation**: Pan, zoom, and focus on specific areas of the application graph.

## Setup

1. **Install the Vite plugin**: Use `@miurajs/miura-vite` to enable manifest generation in your project.
2. **Launch the Architect Server**:
   ```bash
   npx miura-architect server
   ```
3. **Open the Architect UI**: Navigate to `http://localhost:3005` (default) to visualize your app.

---

*See the [Getting Started guide](../packages/miura-architect/docs/GETTING_STARTED.md) for detailed setup instructions.*
