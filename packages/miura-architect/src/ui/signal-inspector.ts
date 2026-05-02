import { MiuraElement, css, html } from '@miurajs/miura-element';
import type { SignalInfo } from '../types.js';
import '@miurajs/miura-ui/elements';

export class MiuraArchitectSignalInspector extends MiuraElement {
  static properties = {
    signal: { type: Object, default: null },
  };

  static state() {
    return {
      activeTab: { type: String, default: 'details' },
      isCollapsed: { type: Boolean, default: false },
    };
  }

  declare signal: SignalInfo | null;
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
      color: var(--mui-color-success);
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

    .kv-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--mui-space-2) var(--mui-space-4);
      align-items: baseline;
    }

    .key {
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
      font-weight: var(--mui-weight-semibold);
      color: var(--mui-color-text-muted);
    }

    .value {
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
      word-break: break-all;
    }

    .history-item {
      padding: var(--mui-space-2);
      border-bottom: 1px solid var(--mui-color-border);
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
    }

    .history-item:last-child {
      border-bottom: 0;
    }

    mui-tabs {
      border-bottom: 1px solid var(--mui-color-border);
    }
  `;

  template() {
    if (!this.signal) {
      return html`
        <div class="empty">
          <mui-icon name="sparkles" size="32"></mui-icon>
          <p>Select a signal to inspect</p>
        </div>
      `;
    }

    return html`
      <div class="header">
        <div class="header-left">
          <div class="title">${this.signal.label ?? this.signal.id}</div>
          ${this.isCollapsed ? '' : html`
            <div class="meta">
              <div class="meta-item"><mui-icon name="hash" size="10"></mui-icon> ${this.signal.id.slice(0, 8)}</div>
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
            { id: 'details', label: 'Details' },
            { id: 'history', label: 'History' },
          ]}
          .active=${this.activeTab}
          @tab-select=${(e: CustomEvent) => { this.activeTab = e.detail.id; }}
        ></mui-tabs>

        <div class="content">
          ${this.activeTab === 'details' ? this.renderDetails() : this.renderHistory()}
        </div>
      `}
    `;
  }

  private renderDetails() {
    const s = this.signal!;
    return html`
      <div class="kv-grid">
        <div class="key">id</div>
        <div class="value">${s.id}</div>
        <div class="key">type</div>
        <div class="value">${s.type}</div>
        <div class="key">reads</div>
        <div class="value">${s.readCount}</div>
        <div class="key">writes</div>
        <div class="value">${s.writeCount}</div>
        <div class="key">value</div>
        <div class="value">${this.renderValue(s.value)}</div>
      </div>
    `;
  }

  private renderHistory() {
    const history = this.signal!.valueHistory ?? [];
    if (history.length === 0) {
      return html`<div class="empty">No history available</div>`;
    }
    return html`
      <div class="history-list">
        ${history.map((val) => html`
          <div class="history-item">
            ${this.renderValue(val)}
          </div>
        `)}
      </div>
    `;
  }

  private renderValue(value: any) {
    if (value === null) return html`<span style="color: var(--mui-color-text-muted)">null</span>`;
    if (typeof value === 'undefined') return html`<span style="color: var(--mui-color-text-muted)">undefined</span>`;
    if (typeof value === 'object') {
      return html`<mui-code block>${JSON.stringify(value, null, 2)}</mui-code>`;
    }
    if (typeof value === 'string') return html`<span style="color: var(--mui-color-success)">"${value}"</span>`;
    if (typeof value === 'number') return html`<span style="color: var(--mui-color-accent)">${value}</span>`;
    if (typeof value === 'boolean') return html`<span style="color: var(--mui-color-danger)">${value}</span>`;
    return String(value);
  }
}

if (!customElements.get('miura-architect-signal-inspector')) {
  customElements.define('miura-architect-signal-inspector', MiuraArchitectSignalInspector);
}
