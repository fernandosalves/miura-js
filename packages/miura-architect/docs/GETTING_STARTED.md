# Getting Started with Miura Architect

This guide will help you set up Miura Architect for your project.

## Prerequisites

- A project built with the Miura framework.
- Vite as the build tool.

## 1. Installation

Install the Architect package and the Vite plugin:

```bash
npm install @miurajs/miura-architect @miurajs/miura-vite
```

## 2. Configure Vite

Add the `miuraArchitectManifestPlugin` to your `vite.config.ts`. This plugin scans your application and generates a manifest of your components and data flows.

```typescript
import { defineConfig } from 'vite';
import { miuraArchitectManifestPlugin } from '@miurajs/miura-vite';

export default defineConfig({
  plugins: [
    miuraArchitectManifestPlugin()
  ]
});
```

## 3. Inject the Bridge

To connect your running application to the Architect UI, you need to inject the bridge script. You can do this manually in your `index.html` or via a local Vite plugin during development:

```typescript
// Example of a local injection plugin
const MiuraArchitectPlugin = () => ({
  name: 'miura-architect-plugin',
  transformIndexHtml(html: string) {
    if (process.env.NODE_ENV !== 'development') return html;
    
    return html.replace(
      '</body>',
      `<script type="module" src="http://localhost:3005/src/bridge.ts"></script>
      </body>`
    );
  }
});
```

## 4. Run the Architect Server

Start the communication bridge server. This server relays messages between your application and the Architect UI.

```bash
npx miura-architect server
```

By default, the server runs on port `3006`.

## 5. Launch the UI

Start the Architect UI development server (or use a production build):

```bash
cd packages/miura-architect
npm run dev
```

Open `http://localhost:3005` in your browser.

## 6. Connect your App

Run your Miura application. It should automatically connect to the bridge and start streaming architectural data to the Architect UI.

---

For more details on the architecture and communication protocol, see the [Overview](./OVERVIEW.md) and [API Specification](./API_SPECIFICATION.md).
