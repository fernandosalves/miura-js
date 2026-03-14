/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom to simulate a browser environment for our tests
    environment: 'jsdom',
    // Make test APIs like `describe` and `it` available globally
    globals: true,
    // Only run files ending in .test.ts to distinguish from Playwright's .spec.ts files
    include: ['**/*.test.ts'],
  },
});
