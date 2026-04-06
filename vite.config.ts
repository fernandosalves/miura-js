import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import path from 'path';

const resolveFromRoot = (...segments: string[]) => path.resolve(__dirname, ...segments);

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/**/*.test.ts'],
    exclude: [...configDefaults.exclude, 'packages/**/*.spec.ts'],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx', '.json'],
    alias: [
      { find: '@miurajsjs/miura-element/server', replacement: resolveFromRoot('packages/miura-element/server.ts') },
      { find: '@miurajsjs/miura-element', replacement: resolveFromRoot('packages/miura-element/index.ts') },
      { find: '@miurajsjs/miura-debugger', replacement: resolveFromRoot('packages/miura-debugger/index.ts') },
      { find: '@miurajsjs/miura-framework', replacement: resolveFromRoot('packages/miura-framework/index.ts') },
      { find: '@miurajsjs/miura-render', replacement: resolveFromRoot('packages/miura-render/index.ts') },
      { find: '@miurajsjs/miura-router', replacement: resolveFromRoot('packages/miura-router/index.ts') },
      { find: '@miurajsjs/miura-i18n', replacement: resolveFromRoot('packages/miura-i18n/index.ts') },
      { find: '@miurajsjs/miura-computing', replacement: resolveFromRoot('packages/miura-computing/index.ts') },
      { find: '@miurajsjs/miura-ai', replacement: resolveFromRoot('packages/miura-ai/index.ts') },
      { find: '@miurajsjs/miura-vite', replacement: resolveFromRoot('packages/miura-vite/index.ts') },
      { find: '@miurajsjs/miura-ui', replacement: resolveFromRoot('packages/miura-ui/index.ts') },
      // Add @miurajs aliases (without extra 'js')
      { find: '@miurajs/miura-element/server', replacement: resolveFromRoot('packages/miura-element/server.ts') },
      { find: '@miurajs/miura-element', replacement: resolveFromRoot('packages/miura-element/index.ts') },
      { find: '@miurajs/miura-render', replacement: resolveFromRoot('packages/miura-render/index.ts') },
      { find: '@miurajs/miura-router', replacement: resolveFromRoot('packages/miura-router/index.ts') },
      { find: '@miurajs/miura-ui', replacement: resolveFromRoot('packages/miura-ui/index.ts') },
      { find: '@miurajs/miura-vite', replacement: resolveFromRoot('packages/miura-vite/index.ts') },
      { find: '@miurajs/miura-debugger', replacement: resolveFromRoot('packages/miura-debugger/index.ts') },
      { find: '@miurajs/miura-framework', replacement: resolveFromRoot('packages/miura-framework/index.ts') },
      { find: '@miurajs/miura-i18n', replacement: resolveFromRoot('packages/miura-i18n/index.ts') },
      { find: '@miurajs/miura-computing', replacement: resolveFromRoot('packages/miura-computing/index.ts') },
      { find: '@miurajs/miura-ai', replacement: resolveFromRoot('packages/miura-ai/index.ts') },
    ],
  },
});
