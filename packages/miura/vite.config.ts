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
      '@miura/miura-debugger': resolve(__dirname, '../miura-debugger/index.ts'),
      '@miura/miura-element': resolve(__dirname, '../miura-element/index.ts'),
      '@miura/miura-framework': resolve(__dirname, '../miura-framework/src/index.ts'),
      '@miura/miura-render': resolve(__dirname, '../miura-render/index.ts'),
      '@miura/miura-router': resolve(__dirname, '../miura-router/index.ts'),
      '@miura/miura-security': resolve(__dirname, '../miura-security/index.ts'),
      '@miura/miura-ui': resolve(__dirname, '../miura-ui/index.ts'),
      '@miura/miura-data-flow': resolve(__dirname, '../miura-data-flow/index.ts')
    }
  }
});
