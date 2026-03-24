import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Miura',
      fileName: (format) => `miura.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@miurajs/miura-debugger': resolve(__dirname, '../miura-debugger/index.ts'),
      '@miurajs/miura-element': resolve(__dirname, '../miura-element/index.ts'),
      '@miurajs/miura-framework': resolve(__dirname, '../miura-framework/src/index.ts'),
      '@miurajs/miura-render': resolve(__dirname, '../miura-render/index.ts'),
      '@miurajs/miura-router': resolve(__dirname, '../miura-router/index.ts'),
      '@miurajs/miura-security': resolve(__dirname, '../miura-security/index.ts'),
      '@miurajs/miura-ui': resolve(__dirname, '../miura-ui/index.ts'),
      '@miurajs/miura-data-flow': resolve(__dirname, '../miura-data-flow/index.ts')
    }
  }
});
