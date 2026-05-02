import type { Plugin } from 'vite';
import { MockEngine } from './engine.js';
import { InMemoryDatabase } from './database.js';
import type { MiuraMocksConfig } from './types.js';

export function miuraMocks(config: MiuraMocksConfig = {}): Plugin {
  let engine: MockEngine | null = null;
  const port = config.port || 3008;

  return {
    name: 'miura-mocks',
    apply: 'serve',
    
    async configureServer(server) {
      const root = server.config.root;
      const dbFile = config.dbFile || '.miura/mock-db.json';
      const db = new InMemoryDatabase(`${root}/${dbFile}`);
      engine = new MockEngine({
        dir: config.dir || 'mocks',
        port,
        root,
        dbFile,
        watch: config.watch ?? true,
      }, db);

      console.log(`[MOCKS] Starting Miura Mock Server on http://localhost:${port}`);
      await engine.start();

      server.httpServer?.once('close', () => {
        void engine?.stop();
        engine = null;
      });
    },

    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `  <script>window.__MIURA_MOCKS_URL__ = 'http://localhost:${port}';</script>\n</head>`
      );
    }
  };
}
