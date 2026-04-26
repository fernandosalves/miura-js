import { MiuraElement, css, html } from '@miurajs/miura-element';
import '../elements/badge.js';
import '../elements/button.js';
import '../elements/icon.js';

export interface PropertyPanelItem {
  label: string;
  value: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export class MuiPropertyPanel extends MiuraElement {
  static properties = {
    heading: { type: String, default: 'Inspector' },
    description: { type: String, default: '' },
    icon: { type: String, default: 'panel' },
    items: { type: Array, default: () => [] },
    collapsed: { type: Boolean, default: false, reflect: true },
  };

  declare heading: string;
  declare description: string;
  declare icon: string;
  declare items: PropertyPanelItem[];
  declare collapsed: boolean;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
    }

    .panel {
      height: 100%;
      min-height: 0;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      background: var(--mui-color-surface);
    }

    .header {
      display: grid;
      gap: var(--mui-space-3);
      padding: var(--mui-space-5);
      border-bottom: 1px solid var(--mui-color-border);
    }

    .headline {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: var(--mui-space-3);
    }

    .title {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
    }

    h3,
    p {
      margin: 0;
    }

    h3 {
      font-size: var(--mui-text-lg);
      font-weight: var(--mui-weight-semibold);
    }

    p {
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
      line-height: 1.45;
    }

    .body {
      min-height: 0;
      overflow: auto;
      padding: var(--mui-space-5);
      display: grid;
      align-content: start;
      gap: var(--mui-space-5);
    }

    :host([collapsed]) .body {
      display: none;
    }

    .props {
      display: grid;
      gap: var(--mui-space-2);
    }

    .prop {
      display: grid;
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
      gap: var(--mui-space-3);
      align-items: center;
      padding: var(--mui-space-3);
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface-muted);
      font-size: var(--mui-text-sm);
    }

    .label {
      color: var(--mui-color-text-muted);
    }

    .value {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: right;
      font-weight: var(--mui-weight-medium);
    }
  `;

  private toggle(): void {
    this.collapsed = !this.collapsed;
    this.emit('collapsed-change', { collapsed: this.collapsed }, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <aside class="panel" part="panel">
        <header class="header" part="header">
          <div class="headline">
            <div class="title">
              <mui-icon name=${this.icon}></mui-icon>
              <h3>${this.heading}</h3>
            </div>
            <mui-button size="sm" variant="ghost" @click=${() => this.toggle()}>
              ${this.collapsed ? 'Open' : 'Fold'}
            </mui-button>
          </div>
          ${this.description ? html`<p>${this.description}</p>` : ''}
          <slot name="header"></slot>
        </header>
        <div class="body" part="body">
          <div class="props" part="properties">
            ${(this.items ?? []).map((item) => html`
              <div class="prop">
                <span class="label">${item.label}</span>
                <span class="value">${item.tone && item.tone !== 'neutral' ? html`<mui-badge tone=${item.tone}>${item.value}</mui-badge>` : item.value}</span>
              </div>
            `)}
          </div>
          <slot></slot>
        </div>
      </aside>
    `;
  }
}

if (!customElements.get('mui-property-panel')) {
  customElements.define('mui-property-panel', MuiPropertyPanel);
}
