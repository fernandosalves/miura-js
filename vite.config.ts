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
    alias: [
      { find: '@miura/miura-element/server', replacement: resolveFromRoot('packages/miura-element/server.ts') },
      { find: '@miura/miura-element', replacement: resolveFromRoot('packages/miura-element/index.ts') },
      { find: '@miura/miura-debugger', replacement: resolveFromRoot('packages/miura-debugger/index.ts') },
      { find: '@miura/miura-framework', replacement: resolveFromRoot('packages/miura-framework/index.ts') },
      { find: '@miura/miura-render', replacement: resolveFromRoot('packages/miura-render/index.ts') },
      { find: '@miura/miura-router', replacement: resolveFromRoot('packages/miura-router/index.ts') },
      { find: '@miura/miura-i18n', replacement: resolveFromRoot('packages/miura-i18n/index.ts') },
      { find: '@miura/miura-computing', replacement: resolveFromRoot('packages/miura-computing/index.ts') },
      { find: '@miura/miura-ai', replacement: resolveFromRoot('packages/miura-ai/index.ts') },
      { find: '@miura/miura-vite', replacement: resolveFromRoot('packages/miura-vite/index.ts') },
    ],
  },
});
