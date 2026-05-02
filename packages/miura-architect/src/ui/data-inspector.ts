import { MiuraElement, css, html } from '@miurajs/miura-element';
import type { StoreInfo } from '../types.js';
import '@miurajs/miura-ui/elements';

export class MiuraArchitectDataInspector extends MiuraElement {
  static properties = {
    store: { type: Object, default: null },
  };

  static state() {
    return {
      activeTab: { type: String, default: 'state' },
      isCollapsed: { type: Boolean, default: false },
    };
  }

  declare store: StoreInfo | null;
  declare activeTab: string;
  declare isCollapsed: boolean;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--mui-color-surface);
    }

    .header {
      padding: var(--mui-space-3) var(--mui-space-4);
      border-bottom: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      min-width: 0;
    }

    .title {
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-md);
      font-weight: var(--mui-weight-bold);
      color: var(--mui-color-accent);
      margin-bottom: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meta {
      display: flex;
      gap: var(--mui-space-3);
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-xs);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: var(--mui-space-1);
    }

    .content {
      padding: var(--mui-space-4);
    }

    .empty {
      padding: var(--mui-space-10);
      text-align: center;
      color: var(--mui-color-text-muted);
    }

    .history-item {
      padding: var(--mui-space-3);
      border-bottom: 1px solid var(--mui-color-border);
    }

    .history-item:last-child {
      border-bottom: 0;
    }

    .action-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--mui-space-2);
    }

    .action-name {
      font-weight: var(--mui-weight-bold);
      color: var(--mui-color-accent);
    }

    .action-time {
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-xs);
    }

    mui-tabs {
      border-bottom: 1px solid var(--mui-color-border);
    }
  `;

  template() {
    if (!this.store) {
      return html`
        <div class="empty">
          <mui-icon name="database" size="32"></mui-icon>
          <p>Select a store to inspect</p>
        </div>
      `;
    }

    return html`
      <div class="header">
        <div class="header-left">
          <div class="title">${this.store.key}</div>
          ${this.isCollapsed ? '' : html`
            <div class="meta">
              <div class="meta-item"><mui-icon name="database" size="10"></mui-icon> Store</div>
            </div>
          `}
        </div>
        <mui-button variant="ghost" size="sm" @click=${() => { this.isCollapsed = !this.isCollapsed; }}>
          <mui-icon name=${this.isCollapsed ? 'chevron-down' : 'chevron-up'}></mui-icon>
        </mui-button>
      </div>

      ${this.isCollapsed ? '' : html`
        <mui-tabs
          .items=${[
            { id: 'state', label: 'State' },
            { id: 'history', label: 'History' },
          ]}
          .active=${this.activeTab}
          @tab-select=${(e: CustomEvent) => { this.activeTab = e.detail.id; }}
        ></mui-tabs>

        <div class="content">
          ${this.activeTab === 'state' ? this.renderState() : this.renderHistory()}
        </div>
      `}
    `;
  }

  private renderState() {
    return html`<mui-code block>${JSON.stringify(this.store!.state ?? {}, null, 2)}</mui-code>`;
  }

  private renderHistory() {
    const history = this.store!.dispatchHistory ?? [];
    if (history.length === 0) {
      return html`<div class="empty">No action history available</div>`;
    }
    return html`
      <div class="history-list">
        ${history.map((entry) => html`
          <div class="history-item">
            <div class="action-header">
              <span class="action-name">${entry.action}</span>
              <span class="action-time">${new Date(entry.timestamp).toLocaleTimeString()}</span>
            </div>
            <mui-code block>${JSON.stringify(entry.args, null, 2)}</mui-code>
          </div>
        `)}
      </div>
    `;
  }
}

if (!customElements.get('miura-architect-data-inspector')) {
  customElements.define('miura-architect-data-inspector', MiuraArchitectDataInspector);
}
