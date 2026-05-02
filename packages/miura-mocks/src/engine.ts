import { appendHeader, createApp, eventHandler, getQuery, readBody, setHeader, setResponseStatus, toNodeListener } from 'h3';
import { listen } from 'listhen';
import type { Listener } from 'listhen';
import { basename, extname, relative, resolve } from 'node:path';
import { FSWatcher, watch } from 'chokidar';
import fg from 'fast-glob';
import { readFileSync } from 'node:fs';
import JSON5 from 'json5';
import { parse as parseTOML } from 'smol-toml';
import { createJiti } from 'jiti';
import type { MockConfig, MockEndpoint, MockContext, MockDatabase } from './types.js';

type LoadedEndpoint = MockEndpoint & {
  id: string;
  path: string;
  methods: string[];
  file?: string;
  pattern: RegExp;
  params: string[];
};

export class MockEngine {
  private config: MockConfig;
  private endpoints = new Map<string, LoadedEndpoint>();
  private db: MockDatabase;
  private listener: Listener | null = null;
  private watcher: FSWatcher | null = null;
  private loading: Promise<void> | null = null;
  private jiti = createJiti(import.meta.url, { cache: false, fsCache: false });

  constructor(config: MockConfig, db: MockDatabase) {
    this.config = {
      ...config,
      root: resolve(config.root),
      dir: resolve(config.root, config.dir),
      dbFile: resolve(config.root, config.dbFile),
      watch: config.watch ?? true,
    };
    this.db = db;
  }

  async start() {
    if (this.listener) return this.listener;

    await this.db.load();
    await this.loadMocks();

    if (this.config.watch) {
      this.watcher = watch(this.config.dir, { ignoreInitial: true });
      this.watcher.on('all', (_event, path) => {
        console.log(`[MOCKS] ${basename(path)} changed, reloading...`);
        void this.loadMocks();
      });
    }

    const app = createApp();
    
    app.use(eventHandler(async (event) => {
      appendHeader(event, 'Access-Control-Allow-Origin', '*');
      appendHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
      appendHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (event.method === 'OPTIONS') {
        setResponseStatus(event, 204);
        return '';
      }

      const path = event.path.split('?')[0];
      const systemResponse = await this.handleSystemRoute(path, event.method);
      if (systemResponse !== undefined) return systemResponse;

      const match = this.matchEndpoint(path, event.method);
      if (!match) {
        setResponseStatus(event, 404);
        return { error: 'Not Found', path, method: event.method };
      }

      const ctx: MockContext = {
        params: match.params,
        query: getQuery(event),
        body: event.method !== 'GET' && event.method !== 'HEAD' ? await readBody(event).catch(() => ({})) : {},
        headers: Object.fromEntries(event.headers.entries()),
        db: this.db,
        request: event.node.req as unknown as Request,
      };

      const result = await match.endpoint.handler(ctx);
      return this.applyMockResponse(event, result);
    }));

    this.listener = await listen(toNodeListener(app), {
      port: this.config.port,
      showURL: true
    });
    return this.listener;
  }

  async stop(): Promise<void> {
    await this.watcher?.close();
    this.watcher = null;
    await this.listener?.close();
    this.listener = null;
  }

  private async loadMocks() {
    this.loading ??= this.readMockFiles().finally(() => {
      this.loading = null;
    });
    return this.loading;
  }

  private async readMockFiles() {
    const files = await fg('**/*.{ts,js,mjs,cjs,json,json5,toml}', { cwd: this.config.dir, absolute: true });
    this.endpoints.clear();
    
    for (const file of files) {
      try {
        const ext = extname(file);
        if (['.ts', '.js', '.mjs', '.cjs'].includes(ext)) {
          await this.loadModuleEndpoints(file);
        } else {
          this.loadStaticEndpoint(file, ext);
        }
      } catch (e) {
        console.error(`[MOCKS] Failed to load ${file}:`, e);
      }
    }

    console.log(`[MOCKS] Loaded ${this.endpoints.size} endpoint(s) from ${this.config.dir}`);
  }

  private async loadModuleEndpoints(file: string) {
    const module = await this.jiti.import(file) as Record<string, unknown>;
    for (const value of Object.values(module)) {
      if (Array.isArray(value)) {
        value.filter(this.isEndpoint).forEach((endpoint) => this.addEndpoint(endpoint, file));
      } else if (this.isEndpoint(value)) {
        this.addEndpoint(value, file);
      }
    }
  }

  private loadStaticEndpoint(file: string, ext: string) {
    const content = readFileSync(file, 'utf-8');
    const data = ext === '.toml' ? parseTOML(content) : ext === '.json5' ? JSON5.parse(content) : JSON.parse(content);
    const relPath = relative(this.config.dir, file).replace(ext, '').replace(/\\/g, '/');
    this.addEndpoint({
      path: `/${relPath}`,
      method: 'GET',
      handler: () => data,
      description: `${basename(file)} static mock`,
    }, file);
  }

  private addEndpoint(endpoint: MockEndpoint, file: string) {
    const methods = (Array.isArray(endpoint.method) ? endpoint.method : [endpoint.method || 'GET'])
      .map((method) => method.toUpperCase());
    const path = endpoint.path.startsWith('/') ? endpoint.path : `/${endpoint.path}`;
    const { pattern, params } = compilePath(path);
    const id = `${methods.join('|')}:${path}`;

    this.endpoints.set(id, {
      ...endpoint,
      id,
      file: relative(this.config.root, file),
      methods,
      path,
      pattern,
      params,
    });
  }

  private isEndpoint(val: any): val is MockEndpoint {
    return val && typeof val === 'object' && 'path' in val && 'handler' in val;
  }

  private matchEndpoint(path: string, method: string): { endpoint: LoadedEndpoint; params: Record<string, string> } | null {
    const requestMethod = method.toUpperCase();
    for (const endpoint of this.endpoints.values()) {
      if (!endpoint.methods.includes(requestMethod) && !(requestMethod === 'HEAD' && endpoint.methods.includes('GET'))) continue;
      const match = endpoint.pattern.exec(path);
      if (!match) continue;

      const params: Record<string, string> = {};
      endpoint.params.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1] ?? '');
      });
      return { endpoint, params };
    }
    return null;
  }

  private async handleSystemRoute(path: string, method: string): Promise<unknown> {
    if (path === '/') {
      return {
        message: 'Miura Mock Server is running',
        health: '/__miura/health',
        endpoints: '/__miura/endpoints',
        database: '/__miura/db',
      };
    }
    if (path === '/__miura/health') {
      return {
        status: 'ok',
        engine: 'miura-mocks',
        root: this.config.root,
        dir: this.config.dir,
        dbFile: this.config.dbFile,
        endpoints: this.endpoints.size,
      };
    }
    if (path === '/__miura/endpoints') {
      return [...this.endpoints.values()].map(({ handler: _handler, pattern: _pattern, params, ...endpoint }) => ({
        ...endpoint,
        params,
      }));
    }
    if (path === '/__miura/db') {
      return this.db.get('') || {};
    }
    if (path === '/__miura/reload' && method === 'POST') {
      await this.loadMocks();
      return { status: 'reloaded', endpoints: this.endpoints.size };
    }
    if (path === '/__miura/reset' && method === 'POST') {
      await this.db.reset();
      return { status: 'reset' };
    }
    return undefined;
  }

  private async applyMockResponse(event: any, result: any) {
    if (result && typeof result === 'object' && ('body' in result || 'status' in result || 'headers' in result || 'delay' in result)) {
      if (result.status) setResponseStatus(event, result.status);
      if (result.headers) {
        for (const [name, value] of Object.entries(result.headers)) {
          setHeader(event, name, String(value));
        }
      }
      if (result.delay) await new Promise((resolveDelay) => setTimeout(resolveDelay, result.delay));
      return result.body;
    }
    return result;
  }
}

function compilePath(path: string): { pattern: RegExp; params: string[] } {
  const params: string[] = [];
  const source = path
    .split('/')
    .map((part) => {
      if (!part) return '';
      if (part.startsWith(':')) {
        params.push(part.slice(1));
        return '([^/]+)';
      }
      if (part === '*') return '.*';
      return escapeRegExp(part);
    })
    .join('/');

  return { pattern: new RegExp(`^${source}/?$`), params };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
