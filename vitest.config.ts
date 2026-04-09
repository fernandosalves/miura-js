/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@miurajs/miura-data-flow': resolve(__dirname, 'packages/miura-data-flow/index.ts'),
      '@miurajs/miura-debugger': resolve(__dirname, 'packages/miura-debugger/index.ts'),
      '@miurajs/miura-render': resolve(__dirname, 'packages/miura-render/index.ts'),
      '@miurajs/miura-element': resolve(__dirname, 'packages/miura-element/index.ts'),
      '@miurajs/miura-router': resolve(__dirname, 'packages/miura-router/index.ts'),
    },
  },
  test: {
    // Use jsdom to simulate a browser environment for our tests
    environment: 'jsdom',
    // Make test APIs like `describe` and `it` available globally
    globals: true,
    // Only run files ending in .test.ts to distinguish from Playwright's .spec.ts files
    include: ['**/*.test.ts'],
  },
});
