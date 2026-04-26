import { MiuraElement, css, html } from '@miurajs/miura-element';
import '../elements/icon.js';

export interface RailItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}

export class MuiIconRail extends MiuraElement {
  static properties = {
    items: { type: Array, default: () => [] },
    active: { type: String, default: '' },
    label: { type: String, default: 'Primary navigation' },
  };

  declare items: RailItem[];
  declare active: string;
  declare label: string;

  static styles = css`
    :host {
      display: block;
      width: var(--mui-rail-width);
      height: 100%;
      background: var(--mui-color-surface-muted);
      border-right: 1px solid var(--mui-color-border);
      font-family: var(--mui-font-sans);
    }

    nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--mui-space-2);
      height: 100%;
      padding: var(--mui-space-4) var(--mui-space-2);
      box-sizing: border-box;
    }

    .brand,
    button {
      width: 40px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--mui-radius-md);
    }

    .brand {
      background: var(--mui-color-accent);
      color: #fff;
      margin-bottom: var(--mui-space-4);
    }

    button {
      border: 1px solid transparent;
      background: transparent;
      color: var(--mui-color-text-muted);
      cursor: pointer;
      position: relative;
      transition: background var(--mui-duration-fast), color var(--mui-duration-fast), border-color var(--mui-duration-fast);
    }

    button:hover {
      color: var(--mui-color-text);
      background: var(--mui-color-surface-hover);
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--mui-focus-ring);
    }

    button.active {
      color: var(--mui-color-accent);
      background: var(--mui-color-surface);
      border-color: var(--mui-color-border);
      box-shadow: var(--mui-shadow-sm);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 3px;
      min-width: 14px;
      height: 14px;
      padding: 0 4px;
      border-radius: var(--mui-radius-pill);
      background: var(--mui-color-danger);
      color: #fff;
      font-size: 10px;
      line-height: 14px;
      font-weight: var(--mui-weight-semibold);
    }

    .footer {
      margin-top: auto;
    }
  `;

  private activate(item: RailItem): void {
    if (item.disabled) return;
    this.active = item.id;
    this.emit('item-select', item, { bubbles: true, composed: true });
  }

  template() {
    const items = this.items ?? [];

    return html`
      <nav part="rail" aria-label=${this.label}>
        <div class="brand" part="brand"><slot name="brand"><mui-icon name="spark"></mui-icon></slot></div>
        ${items.map((item) => html`
          <button
            part="item"
            class=${item.id === this.active ? 'active' : ''}
            title=${item.label}
            aria-label=${item.label}
            aria-current=${item.id === this.active ? 'page' : 'false'}
            ?disabled=${Boolean(item.disabled)}
            @click=${() => this.activate(item)}
          >
            <mui-icon name=${item.icon}></mui-icon>
            ${item.badge ? html`<span class="badge">${item.badge}</span>` : ''}
          </button>
        `)}
        <div class="footer" part="footer"><slot name="footer"></slot></div>
      </nav>
    `;
  }
}

if (!customElements.get('mui-icon-rail')) {
  customElements.define('mui-icon-rail', MuiIconRail);
}
