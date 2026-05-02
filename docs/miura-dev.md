# @miurajs/miura-dev

> Development utilities for the Miura ecosystem – a fast, zero‑config Vite‑powered workflow.

## 📦 Installation
```bash
npm i -D @miurajs/miura-dev @miurajs/miura-vite
```

## 🛠️ Core Features
- **CLI (`miura dev`)** – starts a hot‑reloaded dev server for all workspace packages (admin, public, etc.).
- **Vite plugin** – resolves `@miurajs/*` aliases, injects the Architect bridge, and enables live‑preview of Miura components.
- **Debug overlay** – displays component hierarchy, state snapshots, and performance metrics.
- **Customizable config** – add a `miura.config.ts` at the repository root to override server options, plugins, or Vite settings.

## 🚀 Quick Start
```ts
// miura.config.ts (optional)
export default {
  server: {
    port: 3000,
    open: true,
  },
  plugins: [
    // your extra Vite plugins here
  ],
};
```
Run the dev environment:
```bash
npm run dev   # runs `miura dev` under the hood
```
The command watches all `packages/*` and `apps/*` workspaces, recompiles on change, and reloads the browser automatically.

## 📚 Further Reading
- [Vite Plugin API](../miura-vite/README.md)
- [Architect Bridge Integration](../miura-architect/docs/GETTING_STARTED.md)

---

*License: MIT*
