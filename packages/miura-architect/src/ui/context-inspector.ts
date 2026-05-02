import { MiuraElement, css, html } from '@miurajs/miura-element';
import type { ContextInfo } from '../types.js';
import '@miurajs/miura-ui/elements';

export class MiuraArchitectContextInspector extends MiuraElement {
  static properties = {
    context: { type: Object, default: null },
  };

  declare context: ContextInfo | null;

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
    }

    .title {
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-md);
      font-weight: var(--mui-weight-bold);
      color: var(--mui-color-danger);
      margin-bottom: var(--mui-space-1);
    }

    .meta {
      display: flex;
      gap: var(--mui-space-3);
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-xs);
    }

    .content {
      padding: var(--mui-space-4);
    }

    .section {
      margin-bottom: var(--mui-space-6);
    }

    .section-title {
      font-size: var(--mui-text-xs);
      font-weight: var(--mui-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--mui-color-text-muted);
      margin-bottom: var(--mui-space-3);
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
    }

    .provider-info {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      padding: var(--mui-space-2) var(--mui-space-3);
      background: var(--mui-color-surface-muted);
      border-radius: var(--mui-radius-sm);
      border: 1px solid var(--mui-color-border);
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-sm);
    }

    .consumer-list {
      display: grid;
      gap: var(--mui-space-2);
    }

    .consumer-item {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      padding: var(--mui-space-1) var(--mui-space-2);
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
      color: var(--mui-color-text);
    }

    .empty {
      padding: var(--mui-space-10);
      text-align: center;
      color: var(--mui-color-text-muted);
    }
  `;

  template() {
    if (!this.context) {
      return html`
        <div class="empty">
          <mui-icon name="box" size="32"></mui-icon>
          <p>Select a context to inspect</p>
        </div>
      `;
    }

    return html`
      <div class="header">
        <div class="title">${this.context.key}</div>
        <div class="meta">
          <mui-badge tone=${this.context.providerId ? 'success' : 'neutral'}>
            ${this.context.providerId ? 'Runtime' : 'Static (Manifest)'}
          </mui-badge>
          <span>Context</span>
        </div>
      </div>

      <div class="content">
        <div class="section">
          <div class="section-title">Current Value</div>
          <mui-code block>${JSON.stringify(this.context.value ?? null, null, 2)}</mui-code>
        </div>

        <div class="section">
          <div class="section-title">Provider</div>
          <div class="provider-info">
            <mui-icon name="puzzle" size="14"></mui-icon>
            ${this.context.providerId ?? 'root (global)'}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Consumers (${this.context.consumerIds?.length ?? 0})</div>
          <div class="consumer-list">
            ${(this.context.consumerIds ?? []).length === 0 
              ? html`<div class="empty-list">No active consumers</div>`
              : (this.context.consumerIds ?? []).map(id => html`
                <div class="consumer-item">
                  <mui-icon name="puzzle" size="12"></mui-icon>
                  ${id}
                </div>
              `)}
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('miura-architect-context-inspector')) {
  customElements.define('miura-architect-context-inspector', MiuraArchitectContextInspector);
}
