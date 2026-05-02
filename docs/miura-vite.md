# miura Vite

`@miurajs/miura-vite` is the official Vite plugin for the Miura framework. It handles manifest generation, Hot Module Replacement (HMR) integration, and wires up developer tools like Miura Architect.

## Features

- **Manifest Generation**: Scans your project to generate the architectural manifest required by Miura Architect.
- **HMR Integration**: Fine-grained hot reloading for Miura elements.
- **Development Proxy**: Integrates with Miura Mocks for seamless local development.
- **Alias Resolution**: Automatically handles internal package resolution in monorepos.

## Configuration

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { miuraVitePlugin } from '@miurajs/miura-vite';

export default defineConfig({
  plugins: [
    miuraVitePlugin({
      architect: true,
      mocks: true
    })
  ]
});
```
