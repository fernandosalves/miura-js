import { MiuraElement, css, html } from '@miurajs/miura-element';
import type { ApplicationManifest, AppSnapshot, ArchitectureGraphConfig, ComponentInfo, ContextInfo, DevToolsMessage, FilterOptions, SignalInfo, StoreInfo } from '../types.js';
import { buildGraph } from '../graph/graph-builder.js';
import { nextReconnectDelay } from '../utils/connection.js';
import { filterComponents, filterSignals } from '../utils/filters.js';
import { applyDevtoolsMessage, EMPTY_SNAPSHOT } from '../utils/snapshot-reducer.js';
import { registerIcon } from '@miurajs/miura-ui';
import './toolbar.js';
import './component-tree.js';
import './signals-panel.js';
import './data-browser.js';
import './spatial-graph.js';
import './component-inspector.js';
import './signal-inspector.js';
import './data-inspector.js';
import './context-inspector.js';
import './mock-panel.js';

// Register architecture icon (custom)
registerIcon('architecture', { paths: ['M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zm-11 0h7v7H3z'] });
registerIcon('globe', { paths: ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0 0V2m10 10H2m15.5 0c0 5.523-2.462 10-5.5 10s-5.5-4.477-5.5-10 2.462-10 5.5-10 5.5 4.477 5.5 10z'] });

type MockRuntimeState = {
  status: 'probing' | 'connected' | 'offline' | 'error';
  url: string | null;
  endpoints: any[];
  db: any;
  health?: any;
  error?: string;
};

export class MiuraArchitectMain extends MiuraElement {
  static properties = {
    appSnapshot: { type: Object, default: () => ({ ...EMPTY_SNAPSHOT }) },
    selectedNodeId: { type: String, default: '' },
    isConnected: { type: Boolean, default: false },
    connectionError: { type: String, default: '' },
    searchTerm: { type: String, default: '' },
    applicationManifest: { type: Object, default: null },
    manifestStatus: { type: String, default: 'idle' },
    activeRailId: { type: String, default: 'architecture' },
    theme: { type: String, default: 'dark' },
    inspectorCollapsed: { type: Boolean, default: false },
    mockState: { type: Object, default: () => ({ status: 'probing', url: null, endpoints: [], db: {} }) },
  };

  declare appSnapshot: AppSnapshot;
  declare selectedNodeId: string;
  declare isConnected: boolean;
  declare connectionError: string;
  declare searchTerm: string;
  declare applicationManifest: ApplicationManifest | null;
  declare manifestStatus: 'idle' | 'loading' | 'ready' | 'unavailable';
  declare activeRailId: string;
  declare theme: 'dark' | 'light';
  declare inspectorCollapsed: boolean;
  declare mockState: MockRuntimeState;

  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private manifestRefreshTimer = 0;
  private mockRefreshTimer = 0;
  private graphConfig: ArchitectureGraphConfig = {
    inlineComponentPatterns: ['mui-*'],
    cardComponentPatterns: ['*-app', '*-layout', '*-page', '*-panel'],
  };
  private filters: FilterOptions = {
    hideInternal: true,
    collapseUnused: false,
    onlyShowChanged: false,
    searchTerm: '',
    showComponents: true,
    showSignals: true,
    showStores: true,
    showContext: true,
  };
  private railItems = [
    { id: 'architecture', label: 'Architecture', icon: 'architecture' },
    { id: 'mocks', label: 'API & Mocks', icon: 'globe' },
    { id: 'performance', label: 'Performance', icon: 'activity', disabled: true },
    { id: 'issues', label: 'Issues', icon: 'alert-circle', badge: '3', disabled: true },
    { id: 'memory', label: 'Memory', icon: 'database', disabled: true },
  ];

  static styles = css`
    :host { display: block; height: 100vh; color: var(--mui-color-text); background: var(--mui-color-bg); font-family: var(--mui-font-sans); }
    .rail-footer { display: flex; flex-direction: column; align-items: center; gap: var(--mui-space-2); padding-bottom: var(--mui-space-2); }
    .nav-panel { padding: var(--mui-space-3); height: 100%; overflow: auto; box-sizing: border-box; }
    .nav-panel h3 { margin: 0 0 var(--mui-space-3) 0; font-size: var(--mui-text-xs); text-transform: uppercase; letter-spacing: 0.04em; color: var(--mui-color-text-muted); }
    .content-area { display: grid; grid-template-rows: var(--mui-toolbar-height) minmax(0, 1fr); height: 100%; overflow: hidden; }
    header { display: flex; align-items: center; gap: var(--mui-space-4); padding: 0 var(--mui-space-4); border-bottom: 1px solid var(--mui-color-border); background: var(--mui-color-surface); }
    .brand { font-size: var(--mui-text-sm); font-weight: var(--mui-weight-semibold); }
    .status { margin-left: auto; font-size: var(--mui-text-xs); color: var(--mui-color-text-muted); }
    .status.ok { color: var(--mui-color-success); }
    .status.error { color: var(--mui-color-danger); }
    .main-view { padding: var(--mui-space-3); height: 100%; overflow: hidden; box-sizing: border-box; }
    .main-view > mui-split-pane,
    .main-view > .graph-panel {
      height: 100%;
      min-height: 0;
    }
    .panel { border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-md); background: var(--mui-color-surface); padding: var(--mui-space-3); box-sizing: border-box; min-height: 0; overflow: auto; }
    .graph-panel { display: grid; grid-template-rows: auto minmax(0, 1fr); height: 100%; overflow: hidden; }
    .graph-heading { display: flex; align-items: center; gap: var(--mui-space-2); }
    .graph-heading h3 { margin: 0; }
    .graph-heading .spacer { flex: 1; }
    miura-architect-spatial-graph { height: 100%; min-height: 0; }
    .inspector-stack { min-height: 0; height: 100%; }
    .inspector-panel { padding: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); height: 100%; overflow: hidden; }
    .inspector-header {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      min-height: 42px;
      padding: 0 var(--mui-space-3);
      border-bottom: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface-muted);
    }
    .inspector-title { font-size: var(--mui-text-xs); text-transform: uppercase; letter-spacing: 0.04em; color: var(--mui-color-text-muted); font-weight: var(--mui-weight-semibold); }
    .inspector-body { min-height: 0; overflow: auto; }
    h3 { margin: 0 0 var(--mui-space-2) 0; font-size: var(--mui-text-xs); text-transform: uppercase; letter-spacing: 0.04em; color: var(--mui-color-text-muted); }
    .empty-inspector {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--mui-space-12);
      text-align: center;
      color: var(--mui-color-text-muted);
      height: 100%;
      gap: var(--mui-space-4);
    }
    .empty-inspector p {
      margin: 0;
      font-size: var(--mui-text-sm);
      line-height: 1.5;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.updateTheme();
    this.connect();
    void this.loadApplicationManifest();
    void this.fetchMockState();
  }

  private updateTheme(): void {
    this.dataset.muiTheme = this.theme;
  }

  private toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.updateTheme();
  }

  disconnectedCallback(): void {
    if (this.manifestRefreshTimer) window.clearInterval(this.manifestRefreshTimer);
    if (this.mockRefreshTimer) window.clearTimeout(this.mockRefreshTimer);
    this.socket?.close();
    super.disconnectedCallback();
  }

  private foundManifestUrl: string | null = null;
  private foundMockUrl: string | null = null;

  private async loadApplicationManifest(): Promise<void> {
    if (this.foundManifestUrl) {
      try {
        const response = await fetch(this.foundManifestUrl, { cache: 'no-store' });
        if (response.ok) {
          const manifest = await response.json() as ApplicationManifest;
          this.applicationManifest = normalizeManifest(manifest);
          this.manifestStatus = 'ready';
          return;
        }
      } catch (e) {
        this.foundManifestUrl = null; // Reset if it fails
      }
    }

    const explicit = new URLSearchParams(window.location.search).get('manifest');
    const ports = explicit ? [] : [3000, 3001, 3002];
    const urls = explicit ? [explicit] : ports.map(p => `http://localhost:${p}/__miura_architect__/manifest.json`);

    this.manifestStatus = 'loading';
    
    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
          const manifest = await response.json() as ApplicationManifest;
          this.applicationManifest = normalizeManifest(manifest);
          this.applicationManifest = normalizeManifest(manifest);
          this.graphConfig = {
            ...this.graphConfig,
            ...(this.applicationManifest?.config ?? {}),
          };
          this.manifestStatus = 'ready';
          this.foundManifestUrl = url; // LOCK IT IN
          
          if (!this.manifestRefreshTimer) {
            this.manifestRefreshTimer = window.setInterval(() => {
              void this.loadApplicationManifest();
            }, 5000);
          }
          return;
        }
      } catch (e) {
        // Try next
      }
    }
    
    this.manifestStatus = 'unavailable';
  }

  private async fetchMockState(): Promise<void> {
    if (this.mockRefreshTimer) window.clearTimeout(this.mockRefreshTimer);
    if (this.foundMockUrl) {
      try {
        const [healthRes, epRes, dbRes] = await Promise.all([
          fetch(`${this.foundMockUrl}/__miura/health`, { cache: 'no-store' }).then(r => r.json()),
          fetch(`${this.foundMockUrl}/__miura/endpoints`).then(r => r.json()),
          fetch(`${this.foundMockUrl}/__miura/db`).then(r => r.json()),
        ]);
        this.mockState = { status: 'connected', url: this.foundMockUrl, health: healthRes, endpoints: epRes, db: dbRes };
        this.scheduleMockRefresh();
        return;
      } catch (e) {
        this.foundMockUrl = null; // Reset if it fails
      }
    }

    this.mockState = { ...this.mockState, status: 'probing', url: null, error: undefined };
    const ports = [3008, 3009];
    for (const port of ports) {
      try {
        const url = `http://localhost:${port}`;
        const [healthRes, epRes, dbRes] = await Promise.all([
          fetch(`${url}/__miura/health`, { cache: 'no-store' }).then(r => r.json()),
          fetch(`${url}/__miura/endpoints`).then(r => r.json()),
          fetch(`${url}/__miura/db`).then(r => r.json()),
        ]);
        
        this.mockState = { status: 'connected', url, health: healthRes, endpoints: epRes, db: dbRes };
        this.foundMockUrl = url; // LOCK IT IN
        this.scheduleMockRefresh();
        break;
      } catch (e) {
        // Silent probe
      }
    }

    if (!this.foundMockUrl) {
      this.mockState = { status: 'offline', url: null, endpoints: [], db: {}, error: 'No mock server found on ports 3008 or 3009' };
      this.scheduleMockRefresh();
    }
  }

  private scheduleMockRefresh(): void {
    this.mockRefreshTimer = window.setTimeout(() => this.fetchMockState(), 3000);
  }

  private async postMockAction(action: 'reload' | 'reset'): Promise<void> {
    if (!this.foundMockUrl) {
      await this.fetchMockState();
      if (!this.foundMockUrl) return;
    }

    try {
      await fetch(`${this.foundMockUrl}/__miura/${action}`, { method: 'POST' });
      await this.fetchMockState();
    } catch (error) {
      this.mockState = {
        ...this.mockState,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private connect(): void {
    this.socket = new WebSocket('ws://localhost:3006');
    this.socket.onopen = () => {
      this.isConnected = true;
      this.connectionError = '';
      this.reconnectAttempts = 0;
    };
    this.socket.onmessage = (event) => {
      try {
        this.handleMessage(JSON.parse(String(event.data)) as DevToolsMessage);
      } catch (error) {
        console.warn('[miura-architect] invalid message', error);
      }
    };
    this.socket.onerror = () => {
      this.connectionError = 'socket error';
      this.isConnected = false;
    };
    this.socket.onclose = () => {
      this.isConnected = false;
      this.reconnectAttempts += 1;
      window.setTimeout(() => this.connect(), nextReconnectDelay(this.reconnectAttempts));
    };
  }

  private handleMessage(message: DevToolsMessage): void {
    switch (message.type) {
      case 'APP_STATE_SNAPSHOT':
      case 'component:discovered':
      case 'component:updated':
      case 'component:removed':
      case 'signal:written':
      case 'signal:read':
      case 'store:dispatched':
      case 'consume:resolved':
      case 'FULL_SYNC': {
        this.appSnapshot = applyDevtoolsMessage(this.appSnapshot, message);
        break;
      }
      default:
        break;
    }
  }

  private selectedData(): {
    component: ComponentInfo | null;
    signal: SignalInfo | null;
    store: StoreInfo | null;
    context: ContextInfo | null;
    manifestComponent: ApplicationManifest['components'][number] | null;
    relatedSignals: SignalInfo[];
    relatedContexts: ContextInfo[];
    relatedStores: StoreInfo[];
  } {
    const snapshot = ensureSnapshot(this.appSnapshot);
    const component = snapshot.components.find((item) => item.id === this.selectedNodeId) ?? null;
    
    // Fallback for stores/contexts from manifest
    const store = snapshot.stores.find((s) => s.key === this.selectedNodeId) ?? 
                 (this.applicationManifest?.components.some(c => c.stores?.includes(this.selectedNodeId)) 
                    ? { key: this.selectedNodeId, state: {} } as StoreInfo 
                    : null);
                    
    const context = snapshot.contexts.find((ctx) => ctx.key === this.selectedNodeId) ??
                    (this.applicationManifest?.components.some(c => c.contexts?.some(ctx => ctx.key === this.selectedNodeId))
                      ? { key: this.selectedNodeId, consumerIds: [] } as ContextInfo
                      : null);

    return {
      component,
      signal: snapshot.signals.find((signal) => signal.id === this.selectedNodeId) ?? null,
      store,
      context,
      manifestComponent: component
        ? this.applicationManifest?.components.find((item) => item.tag === component.tag) ?? null
        : null,
      relatedSignals: component
        ? snapshot.signals.filter((signal) =>
            signal.subscribers?.includes(component.id) ||
            signal.writers?.includes(component.id) ||
            signal.dependencies?.includes(component.id))
        : [],
      relatedContexts: component
        ? snapshot.contexts.filter((context) =>
            context.providerId === component.id ||
            context.consumerIds?.includes(component.id))
        : [],
      relatedStores: component
        ? snapshot.stores.filter((store) => store.subscribers?.includes(component.id))
        : [],
    };
  }

  private renderGraphPanel(graphData: ReturnType<typeof buildGraph>, slotName = '') {
    return html`
      <section class="panel graph-panel" slot=${slotName}>
        <div class="graph-heading">
          <h3>Spatial Graph</h3>
          <div class="spacer"></div>
          <mui-button
            variant="ghost"
            size="sm"
            title=${this.inspectorCollapsed ? 'Show inspector' : 'Hide inspector'}
            @click=${() => { this.inspectorCollapsed = !this.inspectorCollapsed; }}
          >
            <mui-icon name=${this.inspectorCollapsed ? 'panel-right-open' : 'panel-right-close'}></mui-icon>
          </mui-button>
        </div>
        <miura-architect-spatial-graph
          .graphData=${graphData}
          .selectedNodeId=${this.selectedNodeId}
          @select=${(event: CustomEvent<{ id: string }>) => { this.selectedNodeId = event.detail.id; }}
        ></miura-architect-spatial-graph>
      </section>
    `;
  }

  private renderInspectorPanel(selected: ReturnType<MiuraArchitectMain['selectedData']>) {
    return html`
      <div class="panel inspector-panel">
        <div class="inspector-header">
          <span class="inspector-title">Inspector</span>
          <div class="spacer"></div>
          <mui-button variant="ghost" size="sm" title="Hide inspector" @click=${() => { this.inspectorCollapsed = true; }}>
            <mui-icon name="panel-right-close"></mui-icon>
          </mui-button>
        </div>
        <div class="inspector-body">
          ${selected.component ? html`
            <miura-architect-component-inspector
              .component=${selected.component}
              .manifestComponent=${selected.manifestComponent}
              .signals=${selected.relatedSignals}
              .contexts=${selected.relatedContexts}
              .stores=${selected.relatedStores}
            ></miura-architect-component-inspector>
          ` : ''}
          ${selected.signal ? html`<miura-architect-signal-inspector .signal=${selected.signal}></miura-architect-signal-inspector>` : ''}
          ${selected.store ? html`<miura-architect-data-inspector .store=${selected.store}></miura-architect-data-inspector>` : ''}
          ${selected.context ? html`<miura-architect-context-inspector .context=${selected.context}></miura-architect-context-inspector>` : ''}
          ${!selected.component && !selected.signal && !selected.store && !selected.context ? html`
            <div class="empty-inspector">
              <mui-icon name="search" size="48"></mui-icon>
              <p>Select a node in the graph or navigation tree to inspect its properties and state</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private buildNavItems(snapshot: AppSnapshot): any[] {
    const componentMap = new Map<string, any>();
    snapshot.components.forEach((c) => {
      componentMap.set(c.id, {
        id: c.id,
        label: c.tag,
        icon: 'node',
        children: [],
      });
    });

    const rootComponents: any[] = [];
    snapshot.components.forEach((c) => {
      const item = componentMap.get(c.id)!;
      if (c.parentId && componentMap.has(c.parentId)) {
        componentMap.get(c.parentId)!.children!.push(item);
      } else {
        rootComponents.push(item);
      }
    });

    const manifestStores = new Set<string>();
    const manifestContexts = new Set<string>();
    if (this.applicationManifest) {
      this.applicationManifest.components.forEach((c) => {
        if (Array.isArray(c.stores)) c.stores.forEach((s) => manifestStores.add(s));
        if (Array.isArray(c.contexts)) c.contexts.forEach((ctx) => manifestContexts.add(ctx.key));
      });
    }

    const stores = [
      ...new Set([...snapshot.stores.map((s) => s.key), ...manifestStores]),
    ].sort();

    const contexts = [
      ...new Set([...snapshot.contexts.map((c) => c.key), ...manifestContexts]),
    ].sort();

    return [
      {
        id: 'nav-components',
        label: 'Components',
        icon: 'columns',
        children: rootComponents,
      },
      {
        id: 'nav-signals',
        label: 'Signals',
        icon: 'sparkles',
        children: snapshot.signals.map((s) => ({ id: s.id, label: s.label || s.id, icon: 'sparkles' })),
      },
      {
        id: 'nav-data',
        label: 'Data',
        icon: 'database',
        children: [
          {
            id: 'nav-stores',
            label: 'Stores',
            icon: 'database',
            children: stores.map((key) => ({ id: key, label: key, icon: 'database' })),
          },
          {
            id: 'nav-contexts',
            label: 'Contexts',
            icon: 'box',
            children: contexts.map((key) => ({ id: key, label: key, icon: 'box' })),
          },
        ],
      },
    ];
  }

  template() {
    const snapshot = ensureSnapshot(this.appSnapshot);
    const filteredComponents = filterComponents(snapshot.components, this.searchTerm, this.filters);
    const filteredSignals = filterSignals(snapshot.signals, this.filters);
    const graphData = buildGraph(
      { ...snapshot, components: filteredComponents, signals: filteredSignals },
      this.selectedNodeId,
      this.filters,
      this.graphConfig,
      this.applicationManifest,
    );
    const selected = this.selectedData();
    const navItems = this.buildNavItems(snapshot);

    return html`
      <mui-app-shell>
        <mui-icon-rail
          slot="rail"
          .active=${this.activeRailId}
          .items=${this.railItems}
          @item-select=${(event: CustomEvent<any>) => { this.activeRailId = event.detail.id; }}
        >
          <div slot="footer" class="rail-footer">
            <mui-button variant="ghost" size="sm" @click=${this.toggleTheme} title="Toggle Theme">
              <mui-icon name=${this.theme === 'dark' ? 'sun' : 'moon'}></mui-icon>
            </mui-button>
          </div>
        </mui-icon-rail>

        <div slot="nav" class="nav-panel">
          <h3>Navigation</h3>
          <mui-content-tree
            .items=${navItems}
            .active=${this.selectedNodeId}
            @item-select=${(event: CustomEvent<any>) => { this.selectedNodeId = event.detail.id; }}
          ></mui-content-tree>
        </div>

        <div class="content-area">
          <header>
            <div class="brand">Miura Architect</div>
            <miura-architect-toolbar
              .searchTerm=${this.searchTerm}
              @search=${(event: CustomEvent<{ term: string }>) => {
                this.searchTerm = event.detail.term ?? '';
                this.filters = { ...this.filters, searchTerm: this.searchTerm };
              }}
            ></miura-architect-toolbar>
            ${this.manifestStatus === 'ready' ? html`<mui-badge>manifest</mui-badge>` : ''}
            <div class="status ${this.isConnected ? 'ok' : this.connectionError ? 'error' : ''}">
              ${this.isConnected ? 'connected' : this.connectionError || 'offline'}
            </div>
          </header>

          <div class="main-view">
            ${this.activeRailId === 'architecture' ? html`
              ${this.inspectorCollapsed ? this.renderGraphPanel(graphData) : html`
                <mui-split-pane size="900" min="560" max="1400" persistKey="miura-architect.inspector-split.v2">
                  ${this.renderGraphPanel(graphData, 'primary')}

                  <div slot="secondary" class="inspector-stack">
                    ${this.renderInspectorPanel(selected)}
                  </div>
                </mui-split-pane>
              `}
            ` : this.activeRailId === 'mocks' ? html`
              <miura-architect-mock-panel
                .mockState=${this.mockState}
                @mock-refresh=${() => this.fetchMockState()}
                @mock-reload=${() => this.postMockAction('reload')}
                @mock-reset=${() => this.postMockAction('reset')}
              ></miura-architect-mock-panel>
            ` : html`
              <section class="panel">
                <mui-empty-state
                  title="${this.railItems.find(i => i.id === this.activeRailId)?.label} is coming soon"
                  description="We are currently building this view to provide deeper insights into your application."
                  icon=${this.railItems.find(i => i.id === this.activeRailId)?.icon || 'sparkles'}
                ></mui-empty-state>
              </section>
            `}
          </div>
        </div>
      </mui-app-shell>
    `;
  }
}

if (!customElements.get('miura-architect-main')) {
  customElements.define('miura-architect-main', MiuraArchitectMain);
}

function ensureSnapshot(value: unknown): AppSnapshot {
  const fallback: AppSnapshot = { ...EMPTY_SNAPSHOT, components: [], signals: [], stores: [], contexts: [] };
  if (!value || typeof value !== 'object') return fallback;
  const rec = value as Partial<AppSnapshot>;
  return {
    components: Array.isArray(rec.components) ? rec.components : [],
    signals: Array.isArray(rec.signals) ? rec.signals : [],
    stores: Array.isArray(rec.stores) ? rec.stores : [],
    contexts: Array.isArray(rec.contexts) ? rec.contexts : [],
    timestamp: Number(rec.timestamp ?? Date.now()),
  };
}

function normalizeManifest(value: ApplicationManifest): ApplicationManifest {
  return {
    version: 1,
    generatedAt: Number(value.generatedAt ?? Date.now()),
    rootDir: String(value.rootDir ?? ''),
    config: {
      inlineComponentPatterns: Array.isArray(value.config?.inlineComponentPatterns) ? value.config.inlineComponentPatterns : [],
      cardComponentPatterns: Array.isArray(value.config?.cardComponentPatterns) ? value.config.cardComponentPatterns : [],
    },
    components: Array.isArray(value.components) ? value.components : [],
    apiEndpoints: Array.isArray(value.apiEndpoints) ? value.apiEndpoints : [],
  };
}
