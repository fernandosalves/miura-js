export interface DevToolsMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp?: number;
  sessionId?: string;
  sequenceId?: number;
}

export interface ComponentInfo {
  id: string;
  tag: string;
  parentId: string | null;
  childIds?: string[];
  properties?: Record<string, unknown>;
  state?: Record<string, unknown>;
  renderTime?: number;
  updateCount?: number;
  mounted?: boolean;
  connected?: boolean;
}

export interface SignalInfo {
  id: string;
  label?: string;
  type?: 'writable' | 'computed' | 'shared' | 'global';
  value?: unknown;
  subscribers?: string[];
  dependencies?: string[];
  writers?: string[];
  writeCount?: number;
  readCount?: number;
  lastWriteTime?: number;
  lastReadTime?: number;
  valueHistory?: unknown[];
}

export interface StoreInfo {
  key: string;
  state: Record<string, unknown>;
  subscribers?: string[];
  dispatchHistory?: Array<{
    action: string;
    args: unknown[];
    timestamp: number;
    duration?: number;
    beforeState?: Record<string, unknown>;
    afterState?: Record<string, unknown>;
  }>;
}

export interface ContextInfo {
  key: string;
  value?: unknown;
  providerId?: string;
  consumerIds?: string[];
}

export interface AppSnapshot {
  components: ComponentInfo[];
  signals: SignalInfo[];
  stores: StoreInfo[];
  contexts: ContextInfo[];
  timestamp: number;
}

export interface ArchitectureGraphConfig {
  inlineComponentPatterns?: string[];
  cardComponentPatterns?: string[];
}

export interface ApplicationManifestField {
  name: string;
  source: 'static-properties' | 'state' | 'signal' | 'computed' | 'inferred';
}

export interface ApplicationManifestApiEndpoint {
  method?: string;
  path: string;
  source?: string;
  file?: string;
}

export interface ApplicationManifestComponent {
  tag: string;
  className: string;
  file: string;
  architect?: {
    type?: 'application' | 'component' | 'layout' | 'page' | 'ui' | 'service' | 'store' | 'provider' | 'router' | 'external' | 'inline';
    display?: 'card' | 'inline';
    label?: string;
  };
  properties: ApplicationManifestField[];
  state: ApplicationManifestField[];
  signals: ApplicationManifestField[];
  contexts: Array<{ key: string; role: 'provider' | 'consumer' }>;
  stores: string[];
  api: ApplicationManifestApiEndpoint[];
  children: string[];
}

export interface ApplicationManifest {
  version: 1;
  generatedAt: number;
  rootDir: string;
  config: ArchitectureGraphConfig;
  components: ApplicationManifestComponent[];
  apiEndpoints: ApplicationManifestApiEndpoint[];
}

export interface ArchitectureCardItem {
  id?: string;
  name: string;
  valuePreview?: string;
  type?: string;
  source?: 'runtime' | 'manifest' | 'merged';
  activity?: {
    reads?: number;
    writes?: number;
    updates?: number;
    lastActiveTime?: number;
  };
}

export interface ArchitectureCardSection {
  id: 'state' | 'properties' | 'signals' | 'contexts' | 'stores' | 'api' | 'ui-elements' | string;
  title: string;
  items: ArchitectureCardItem[];
  collapsed?: boolean;
  emptyLabel?: string;
}

export type ArchitectureNodeType = 'app' | 'component' | 'signal' | 'store' | 'context' | 'api' | 'external';

export type ArchitectureNodeTone =
  | 'app'
  | 'component'
  | 'signal'
  | 'store'
  | 'context'
  | 'api'
  | 'external'
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger';

export interface FilterOptions {
  hideInternal: boolean;
  collapseUnused: boolean;
  onlyShowChanged: boolean;
  searchTerm: string;
  showComponents: boolean;
  showSignals: boolean;
  showStores: boolean;
  showContext: boolean;
  minRenderTime?: number;
}

export interface NodeCanvasNode {
  id: string;
  x: number;
  y: number;
  width?: number;
  title: string;
  subtitle?: string;
  icon?: string;
  tone?: ArchitectureNodeTone;
  type: ArchitectureNodeType;
  nodeData?: any;
  depth?: number;
  category?: string;
  sections?: ArchitectureCardSection[];
  groupedCount?: number;
}

export interface NodeCanvasConnector {
  id: string;
  from: string;
  to: string;
  fromItemId?: string;
  toItemId?: string;
  label?: string;
  tone?: ArchitectureNodeTone;
  style?: 'solid' | 'dashed' | 'dotted';
  activity?: {
    count?: number;
    lastActiveTime?: number;
  };
  type: 'dependency' | 'binding' | 'consume' | 'data-flow' | 'action';
}

export interface GraphData {
  nodes: NodeCanvasNode[];
  connectors: NodeCanvasConnector[];
}
