import { MiuraElement, css, html } from '@miurajs/miura-element';
import '@miurajs/miura-ui/elements';

type MockPanelState = {
  status: 'probing' | 'connected' | 'offline' | 'error';
  url: string | null;
  endpoints: any[];
  db: any;
  health?: any;
  error?: string;
};

export class MiuraArchitectMockPanel extends MiuraElement {
  static properties = {
    mockState: { type: Object, default: () => ({ status: 'probing', url: null, endpoints: [], db: {} }) },
  };

  declare mockState: MockPanelState;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
    }

    .container {
      display: grid;
      grid-template-columns: 320px minmax(0, 1fr);
      height: 100%;
      gap: 1px;
      background: var(--mui-color-border);
    }

    .sidebar {
      background: var(--mui-color-surface);
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .panel-header {
      padding: var(--mui-space-3);
      border-bottom: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface-muted);
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
    }

    .panel-title {
      font-size: var(--mui-text-xs);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--mui-color-text-muted);
      font-weight: var(--mui-weight-bold);
    }

    .spacer {
      flex: 1;
    }

    .meta {
      display: flex;
      flex-direction: column;
      gap: var(--mui-space-1);
      padding: var(--mui-space-3);
      border-bottom: 1px solid var(--mui-color-border);
      color: var(--mui-color-text-muted);
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
      line-height: 1.5;
    }

    .endpoint-list {
      flex: 1;
      overflow: auto;
      padding: var(--mui-space-2);
    }

    .endpoint-item {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      padding: var(--mui-space-2) var(--mui-space-3);
      border-radius: var(--mui-radius-md);
      cursor: pointer;
      font-size: var(--mui-text-sm);
      color: var(--mui-color-text-muted);
    }

    .endpoint-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--mui-color-text);
    }

    .method {
      font-size: 10px;
      font-weight: var(--mui-weight-bold);
      padding: 2px 4px;
      border-radius: 4px;
      min-width: 40px;
      text-align: center;
      background: #333;
      color: #fff;
    }

    .method[data-method="GET"] { background: #22c55e; }
    .method[data-method="POST"] { background: #3b82f6; }
    .method[data-method="PUT"] { background: #f59e0b; }
    .method[data-method="PATCH"] { background: #a855f7; }
    .method[data-method="DELETE"] { background: #ef4444; }

    .path {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .main {
      background: var(--mui-color-bg);
      display: grid;
      grid-template-rows: 1fr 1fr;
      min-height: 0;
    }

    .view-section {
      display: flex;
      flex-direction: column;
      background: var(--mui-color-surface);
      min-height: 0;
    }

    .scroll-body {
      flex: 1;
      overflow: auto;
      padding: var(--mui-space-4);
    }

    pre {
      margin: 0;
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
      color: #7dd3fc;
      line-height: 1.6;
    }

    .db-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--mui-space-3);
      border-bottom: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface-muted);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--mui-color-text-muted);
      gap: var(--mui-space-3);
      padding: var(--mui-space-5);
      text-align: center;
      line-height: 1.5;
    }

    .actions {
      display: flex;
      gap: var(--mui-space-2);
      flex-wrap: wrap;
    }
  `;

  private refreshMocks(): void {
    this.dispatchEvent(new CustomEvent('mock-refresh', { bubbles: true, composed: true }));
  }

  private reloadMocks(): void {
    this.dispatchEvent(new CustomEvent('mock-reload', { bubbles: true, composed: true }));
  }

  private resetDatabase(): void {
    this.dispatchEvent(new CustomEvent('mock-reset', { bubbles: true, composed: true }));
  }

  private exportSnapshot(): void {
    const payload = JSON.stringify(this.mockState?.db || {}, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'miura-mock-db.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  template() {
    const endpoints = this.mockState?.endpoints || [];
    const db = this.mockState?.db || {};
    const status = this.mockState?.status || 'probing';
    const url = this.mockState?.url;
    const health = this.mockState?.health;
    const statusVariant = status === 'connected' ? 'success' : status === 'probing' ? 'warning' : 'danger';

    return html`
      <div class="container">
        <aside class="sidebar">
          <div class="panel-header">
            <span class="panel-title">Discovered Mocks</span>
            <span class="spacer"></span>
            <mui-button variant="ghost" size="sm" title="Refresh" @click=${this.refreshMocks}>
              <mui-icon name="refresh-ccw" size="14"></mui-icon>
            </mui-button>
          </div>
          <div class="meta">
            <span>Status: <mui-badge variant=${statusVariant}>${status}</mui-badge></span>
            <span>URL: ${url || 'probing localhost:3008, 3009'}</span>
            ${health?.dir ? html`<span>Dir: ${health.dir}</span>` : ''}
            ${this.mockState?.error ? html`<span>Error: ${this.mockState.error}</span>` : ''}
          </div>
          <div class="endpoint-list">
            ${endpoints.length ? endpoints.map(ep => html`
              <div class="endpoint-item">
                <span class="method" data-method=${ep.methods?.[0] || ep.method || 'GET'}>${ep.methods?.join(',') || ep.method || 'GET'}</span>
                <span class="path">${ep.path}</span>
              </div>
            `) : html`
              <div class="empty-state">
                <mui-icon name="globe" size="24"></mui-icon>
                <span>${status === 'connected' ? 'No mocks found in the configured mocks directory' : 'Mock server is not connected yet'}</span>
              </div>
            `}
          </div>
        </aside>

        <main class="main">
          <section class="view-section">
            <div class="db-header">
              <span class="panel-title">Mock Database (Real-time)</span>
              <mui-badge variant=${statusVariant}>${endpoints.length} endpoints</mui-badge>
            </div>
            <div class="scroll-body">
              <pre>${JSON.stringify(db, null, 2)}</pre>
            </div>
          </section>

          <section class="view-section" style="border-top: 1px solid var(--mui-color-border)">
            <div class="panel-header">
              <span class="panel-title">Quick Actions</span>
            </div>
            <div class="scroll-body">
              <div class="actions">
                <mui-button variant="outline" size="sm" @click=${this.reloadMocks} ?disabled=${status !== 'connected'}>
                  <mui-icon name="refresh-ccw" size="14" slot="prefix"></mui-icon>
                  Reload Mocks
                </mui-button>
                <mui-button variant="outline" size="sm" @click=${this.resetDatabase} ?disabled=${status !== 'connected'}>
                  <mui-icon name="trash-2" size="14" slot="prefix"></mui-icon>
                  Reset Database
                </mui-button>
                <mui-button variant="outline" size="sm" @click=${this.exportSnapshot}>
                  <mui-icon name="download" size="14" slot="prefix"></mui-icon>
                  Export Snapshot
                </mui-button>
              </div>
            </div>
          </section>
        </main>
      </div>
    `;
  }
}

if (!customElements.get('miura-architect-mock-panel')) {
  customElements.define('miura-architect-mock-panel', MiuraArchitectMockPanel);
}
