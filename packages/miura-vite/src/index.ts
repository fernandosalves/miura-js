import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';

export { islandsPlugin } from './islands-plugin.js';
export type { IslandsPluginOptions, IslandComponentConfig, HydrationStrategy } from './islands-plugin.js';

export interface MiuraArchitectManifestPluginOptions {
  enabled?: boolean;
  outFile?: string;
  include?: string[];
  exclude?: string[];
  inlineComponentPatterns?: string[];
  cardComponentPatterns?: string[];
}

export interface MiuraVitePluginOptions {
  architect?: boolean | MiuraArchitectManifestPluginOptions & {
    bridge?: boolean;
    bridgePath?: string;
  };
}

interface ManifestField {
  name: string;
  source: 'static-properties' | 'state' | 'signal' | 'computed' | 'inferred';
}

interface ManifestApiEndpoint {
  method?: string;
  path: string;
  source?: string;
  file?: string;
}

interface ManifestComponent {
  tag: string;
  className: string;
  file: string;
  architect?: {
    type?: 'application' | 'component' | 'layout' | 'page' | 'ui' | 'service' | 'store' | 'provider' | 'router' | 'external' | 'inline';
    display?: 'card' | 'inline';
    label?: string;
  };
  properties: ManifestField[];
  state: ManifestField[];
  signals: ManifestField[];
  contexts: Array<{ key: string; role: 'provider' | 'consumer' }>;
  stores: string[];
  api: ManifestApiEndpoint[];
  children: string[];
}

export interface ApplicationManifest {
  version: number;
  generatedAt: string;
  stamp?: string;
  rootDir: string;
  config: {
    inlineComponentPatterns: string[];
    cardComponentPatterns: string[];
  };
  components: ManifestComponent[];
  apiEndpoints: ManifestApiEndpoint[];
}

const DEFAULT_INCLUDE = ['src'];
const DEFAULT_EXCLUDE = ['node_modules', 'dist', '.git', '.miura'];
const DEFAULT_INLINE_COMPONENT_PATTERNS = ['mui-*'];
const DEFAULT_CARD_COMPONENT_PATTERNS = ['*-app', '*-layout', '*-page', '*-panel'];
const ARCHITECT_BRIDGE_PATH = '/@miura-architect/bridge';

export function miuraVitePlugin(options: MiuraVitePluginOptions = {}): Plugin[] {
  const architectOptions = options.architect === true ? {} : options.architect || undefined;
  const plugins: Plugin[] = [];

  if (options.architect) {
    plugins.push(miuraArchitectManifestPlugin(architectOptions));
    if (architectOptions?.bridge !== false) {
      plugins.push(miuraArchitectBridgePlugin(architectOptions?.bridgePath ?? ARCHITECT_BRIDGE_PATH));
    }
  }

  return plugins;
}

export function miuraArchitectBridgePlugin(path = ARCHITECT_BRIDGE_PATH): Plugin {
  return {
    name: 'miura-architect-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(path, (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-store');
        res.end("import '@miurajs/miura-architect/bridge';\n");
      });
    },
    transformIndexHtml(html) {
      if (html.includes(path)) return html;
      return html.replace('</body>', `  <script type="module" src="${path}"></script>\n</body>`);
    },
  };
}

export function miuraArchitectManifestPlugin(options: MiuraArchitectManifestPluginOptions = {}): Plugin {
  const enabled = options.enabled ?? true;
  let resolvedConfig: ResolvedConfig;
  let manifest: ApplicationManifest = emptyManifest(process.cwd(), options);
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;

  async function refreshManifest(reason: string): Promise<void> {
    if (!enabled) return;
    manifest = await buildManifest(resolvedConfig.root, options);
    await writeManifest(resolvedConfig.root, options.outFile, manifest);
    resolvedConfig.logger.info(`[miura-architect] manifest ${reason}: ${manifest.components.length} components`);
  }

  function scheduleRefresh(reason: string): void {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      void refreshManifest(reason);
    }, 120);
  }

  return {
    name: 'miura-architect-manifest',
    configResolved(config) {
      resolvedConfig = config;
    },
    async buildStart() {
      await refreshManifest('generated');
    },
    configureServer(server: ViteDevServer) {
      if (!enabled) return;

      void refreshManifest('started');
      server.watcher.on('add', (path) => {
        if (shouldHandlePath(path, resolvedConfig.root, options)) scheduleRefresh('updated');
      });
      server.watcher.on('change', (path) => {
        if (shouldHandlePath(path, resolvedConfig.root, options)) scheduleRefresh('updated');
      });
      server.watcher.on('unlink', (path) => {
        if (shouldHandlePath(path, resolvedConfig.root, options)) scheduleRefresh('updated');
      });

      server.middlewares.use('/__miura_architect__/manifest.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(manifest));
      });
    },
  };
}

async function buildManifest(root: string, options: MiuraArchitectManifestPluginOptions): Promise<ApplicationManifest> {
  const files = collectFiles(root, options);
  
  // 1. Pass 0: Pre-scan for global context keys (to resolve variables to IDs)
  const contextKeyMap = new Map<string, string>();
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*=\s*createContextKey(?:<[^>]*>)?\s*\(\s*['"]([^'"]+)['"]/g)) {
      contextKeyMap.set(match[1], match[2]);
    }
  }

  const components: ManifestComponent[] = [];
  const apiEndpoints: ManifestApiEndpoint[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const relativeFile = relative(root, file);
    const fileApis = extractApiEndpoints(source, relativeFile);
    apiEndpoints.push(...fileApis);
    components.push(...extractComponents(source, relativeFile, fileApis, contextKeyMap));
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    rootDir: root,
    config: {
      inlineComponentPatterns: options.inlineComponentPatterns ?? DEFAULT_INLINE_COMPONENT_PATTERNS,
      cardComponentPatterns: options.cardComponentPatterns ?? DEFAULT_CARD_COMPONENT_PATTERNS,
    },
    components,
    apiEndpoints,
  };
}

function collectFiles(root: string, options: MiuraArchitectManifestPluginOptions): string[] {
  const include = options.include ?? DEFAULT_INCLUDE;
  const files: string[] = [];
  for (const entry of include) {
    const target = resolve(root, entry);
    if (existsSync(target)) collectFrom(target, root, options, files);
  }
  return files.sort();
}

function collectFrom(path: string, root: string, options: MiuraArchitectManifestPluginOptions, files: string[]): void {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    if (isExcluded(path, root, options)) return;
    for (const child of readdirSync(path)) collectFrom(join(path, child), root, options, files);
    return;
  }
  if (!/\.(ts|tsx|js|jsx)$/.test(path)) return;
  if (isExcluded(path, root, options)) return;
  files.push(path);
}

function isExcluded(path: string, root: string, options: MiuraArchitectManifestPluginOptions): boolean {
  const relativePath = relative(root, path);
  const segments = relativePath.split(/[\\/]/);
  return (options.exclude ?? DEFAULT_EXCLUDE).some((pattern) => segments.includes(pattern) || globToRegExp(pattern).test(relativePath));
}

function shouldHandlePath(path: string, root: string, options: MiuraArchitectManifestPluginOptions): boolean {
  if (!/\.(ts|tsx|js|jsx)$/.test(path)) return false;
  return !isExcluded(path, root, options);
}

function extractComponents(
  source: string, 
  file: string, 
  apiEndpoints: ManifestApiEndpoint[],
  contextKeyMap: Map<string, string>
): ManifestComponent[] {
  const components: ManifestComponent[] = [];
  // Support MiuraElement, MiuraFramework, and MiuraNanoElement
  const classPattern = /class\s+(\w+)\s+extends\s+(?:MiuraElement|MiuraFramework|MiuraNanoElement)/g;
  let match: RegExpExecArray | null;
  
  while ((match = classPattern.exec(source))) {
    const className = match[1];
    const classBody = source.slice(match.index, nextClassBoundary(source, match.index + match[0].length));
    
    const tag = findComponentTag(source, className) || kebabCase(className);
    const children = extractChildTags(classBody, tag);
    console.log(`[miura-architect] Component: "${className}" Tag: "${tag}" Children: ${children.length}`);
    if (children.includes(tag)) console.log(`[miura-architect] WARNING: ${tag} still in children!`);
    
    components.push({
      tag,
      className,
      file,
      architect: extractArchitectMetadata(source, classBody, className),
      properties: [
        ...extractStaticObjectKeys(classBody, 'properties', 'static-properties'),
        ...extractStaticObjectKeys(classBody, 'config', 'static-properties') // Support static config
      ],
      state: extractStaticObjectKeys(classBody, 'state', 'state'),
      signals: extractSignalFields(classBody),
      contexts: extractContextUsage(classBody, contextKeyMap),
      stores: extractStores(classBody),
      api: apiEndpoints,
      children,
    });
  }
  return components;
}

function extractArchitectMetadata(
  source: string,
  classBody: string,
  className: string,
): ManifestComponent['architect'] | undefined {
  const fromStatic = extractObjectStringValue(classBody, 'static\\s+architect', 'type')
    ? {
        type: normalizeArchitectType(extractObjectStringValue(classBody, 'static\\s+architect', 'type')),
        display: normalizeArchitectDisplay(extractObjectStringValue(classBody, 'static\\s+architect', 'display')),
        label: extractObjectStringValue(classBody, 'static\\s+architect', 'label'),
      }
    : undefined;

  const decoratorMatch = source.match(new RegExp(`@component\\(\\s*\\{([\\s\\S]*?)\\}\\s*\\)\\s*(?:export\\s+)?class\\s+${className}\\b`));
  const decoratorObject = decoratorMatch?.[1] ?? '';
  const fromDecorator = decoratorObject
    ? {
        type: normalizeArchitectType(
          extractObjectStringValue(decoratorObject, '', 'type') ??
          extractObjectStringValue(decoratorObject, '', 'componentType') ??
          extractObjectStringValue(decoratorObject, '', 'role'),
        ),
        display: normalizeArchitectDisplay(
          extractObjectStringValue(decoratorObject, '', 'display') ??
          extractObjectStringValue(decoratorObject, '', 'architectDisplay'),
        ),
        label: extractObjectStringValue(decoratorObject, '', 'label'),
      }
    : undefined;

  const architect = compactArchitect({
    ...fromDecorator,
    ...fromStatic,
  });
  return architect.type || architect.display || architect.label ? architect : undefined;
}

function extractObjectStringValue(source: string, objectPrefix: string, key: string): string | undefined {
  const body = objectPrefix
    ? source.match(new RegExp(`${objectPrefix}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*(?:;|\\n)`))?.[1] ?? ''
    : source;
  if (!body) return undefined;
  return body.match(new RegExp(`\\b${key}\\s*:\\s*['"\`]([^'"\`]+)['"\`]`))?.[1];
}

function normalizeArchitectType(value: string | undefined): ManifestComponent['architect'] extends infer T
  ? T extends { type?: infer R } ? R | undefined : undefined
  : undefined {
  const allowed = new Set(['application', 'component', 'layout', 'page', 'ui', 'service', 'store', 'provider', 'router', 'external', 'inline']);
  return value && allowed.has(value) ? value as any : undefined;
}

function normalizeArchitectDisplay(value: string | undefined): 'card' | 'inline' | undefined {
  return value === 'card' || value === 'inline' ? value : undefined;
}

function compactArchitect(value: NonNullable<ManifestComponent['architect']>): NonNullable<ManifestComponent['architect']> {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as NonNullable<ManifestComponent['architect']>;
}

function nextClassBoundary(source: string, start: number): number {
  const next = source.slice(start).search(/\n(?:export\s+)?class\s+\w+/);
  return next === -1 ? source.length : start + next;
}

function findComponentTag(source: string, className: string): string | undefined {
  // Check static tagName
  const tagNamePattern = new RegExp(`static\\s+tagName\\s*=\\s*['"\`]([^'"\`]+)['"\`]`);
  const tagNameMatch = source.match(tagNamePattern);
  if (tagNameMatch) return tagNameMatch[1];

  const definePattern = new RegExp(`customElements\\.define\\(\\s*['"\`]([^'"\`]+)['"\`]\\s*,\\s*${className}\\s*\\)`);
  const defineMatch = source.match(definePattern);
  if (defineMatch) return defineMatch[1];
  
  const componentPattern = new RegExp(`@component\\(\\s*\\{[^}]*tag\\s*:\\s*['"\`]([^'"\`]+)['"\`]`);
  return source.match(componentPattern)?.[1];
}

function extractStaticObjectKeys(source: string, name: string, fieldSource: ManifestField['source']): ManifestField[] {
  const fields: ManifestField[] = [];
  
  // 1. Traditional static properties = { ... }
  const objectPattern = new RegExp(`static\\s+${name}\\s*[:=]\\s*\\{([\\s\\S]*?)\\}\\s*(?:;|\\n)`, 'g');
  const match = objectPattern.exec(source);
  if (match) {
    const content = match[1];
    const keyMatches = content.matchAll(/([A-Za-z_$][\w$]*)\s*[:=]/g);
    for (const k of keyMatches) {
      fields.push({ name: k[1], source: fieldSource });
    }
  }
  
  // 2. Decorators: @property, @state, @global
  const decoratorTag = name === 'properties' ? 'property' : (name === 'state' ? 'state' : null);
  if (decoratorTag) {
    // Match @property(...) fieldName or @global(...) fieldName
    const decPattern = new RegExp(`@(?:${decoratorTag}|global)\\s*\\(.*?\\)\\s*(?:private|public|protected)?\\s*(\\w+)`, 'g');
    for (const m of source.matchAll(decPattern)) {
      fields.push({ name: m[1], source: fieldSource });
    }
  }
  
  return fields;
}

function extractSignalFields(source: string): ManifestField[] {
  const fields = new Map<string, ManifestField>();
  for (const match of source.matchAll(/(?:private|public|protected)?\s*(\w+)\s*=\s*(signal|computed)\s*\(/g)) {
    fields.set(match[1], {
      name: match[1],
      source: match[2] === 'computed' ? 'computed' : 'signal',
    });
  }
  return [...fields.values()];
}

function extractContextUsage(source: string, contextKeyMap: Map<string, string>): Array<{ key: string; role: 'provider' | 'consumer' }> {
  const contexts = new Map<string, { key: string; role: 'provider' | 'consumer' }>();
  
  const resolveKey = (val: string) => contextKeyMap.get(val) || val;

  // 1. Standalone / Helper calls
  // matches: provideContext(this, KEY) or consumeContext(this, KEY)
  for (const match of source.matchAll(/(provide|consume)Context\s*\(\s*this\s*,\s*([A-Za-z0-9_]+)/g)) {
    const role = match[1] === 'provide' ? 'provider' : 'consumer';
    const key = resolveKey(match[2]);
    contexts.set(`${role}:${key}`, { key, role });
  }

  // 2. Decorators
  // matches: @provide(KEY) or @consume(KEY)
  for (const match of source.matchAll(/@(provide|consume)\s*\(\s*([A-Za-z0-9_]+)\s*\)/g)) {
    const role = match[1] === 'provide' ? 'provider' : 'consumer';
    const key = resolveKey(match[2]);
    contexts.set(`${role}:${key}`, { key, role });
  }

  // 3. Instance methods (v2 pattern)
  // matches: this.$provide(KEY, ...) or this.$consume(KEY)
  for (const match of source.matchAll(/this\.\$(provide|consume)\s*\(\s*([A-Za-z0-9_]+)/g)) {
    const role = match[1] === 'provide' ? 'provider' : 'consumer';
    const key = resolveKey(match[2]);
    contexts.set(`${role}:${key}`, { key, role });
  }
  
  return [...contexts.values()];
}

function extractStores(source: string): string[] {
  const stores = new Set<string>();
  for (const match of source.matchAll(/\b(\w+Store)\b/g)) stores.add(match[1]);
  return [...stores].sort();
}

const TAG_BLACKLIST = [
  'utf-8', 'application-json', 'no-cache', 'data-theme', 'utf8',
  'box-sizing', 'border-box', 'flex-direction', 'justify-content', 'align-items',
  'space-between', 'backdrop-filter', 'z-index', 'min-width', 'max-width',
  'min-height', 'max-height', 'line-height', 'font-size', 'font-weight',
  'letter-spacing', 'text-transform', 'white-space', 'text-overflow',
  'overflow-y', 'overflow-x', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom',
  'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
  'border-left', 'border-right', 'border-top', 'border-bottom',
  'border-radius', 'border-color', 'border-width', 'box-shadow',
  'background-color', 'pointer-events', 'user-select', 'flex-shrink', 'flex-grow',
  'grid-template-columns', 'grid-template-rows', 'aspect-ratio',
  'linear-gradient', 'radial-gradient', 'color-mix', 'webkit-box', 'webkit-line-clamp',
  'webkit-box-orient', 'font-family', 'vertical-align', 'text-decoration',
  'system-ui', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
  'text-anchor', 'dominant-baseline', 'outline-offset', 'border-left-width'
];

function extractChildTags(source: string, ownTag: string): string[] {
  const children = new Set<string>();
  const tagPattern = /\b[a-z0-9]+-[a-z0-9-]+\b/g;
  
  for (const match of source.matchAll(tagPattern)) {
    const tag = match[0].toLowerCase().trim();
    const normalizedOwnTag = ownTag.toLowerCase().trim();
    
    // Ignore blacklisted terms and the component's own tag
    if (!TAG_BLACKLIST.includes(tag) && tag !== normalizedOwnTag) {
      children.add(tag);
    }
  }
  
  return [...children];
}

function extractApiEndpoints(source: string, file: string): ManifestApiEndpoint[] {
  const endpoints: ManifestApiEndpoint[] = [];
  for (const match of source.matchAll(/fetch\s*\(\s*['"`]([^'"`]+)['"`]/g)) {
    endpoints.push({ path: match[1], source: 'fetch', file });
  }
  for (const match of source.matchAll(/API_URL\s*=\s*['"`]([^'"`]+)['"`]/g)) {
    endpoints.push({ path: match[1], source: 'API_URL', file });
  }
  return endpoints;
}

async function writeManifest(root: string, outFile: string | undefined, manifest: ApplicationManifest): Promise<void> {
  const target = resolve(root, outFile ?? '.miura/architect-manifest.json');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`);
}

function emptyManifest(root: string, options: MiuraArchitectManifestPluginOptions): ApplicationManifest {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    stamp: 'v3-blacklist-applied',
    rootDir: root,
    config: {
      inlineComponentPatterns: options.inlineComponentPatterns ?? DEFAULT_INLINE_COMPONENT_PATTERNS,
      cardComponentPatterns: options.cardComponentPatterns ?? DEFAULT_CARD_COMPONENT_PATTERNS,
    },
    components: [],
    apiEndpoints: [],
  };
}

function kebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}
