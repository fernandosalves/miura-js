import { MiuraElement, css, html } from '@miurajs/miura-element';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
}

export class MuiMenu extends MiuraElement {
  static properties = {
    items: { type: Array, default: () => [] },
    label: { type: String, default: 'Menu' },
  };

  declare items: MenuItem[];
  declare label: string;

  static styles = css`
    :host {
      display: block;
      min-width: 220px;
      font-family: var(--mui-font-sans);
      color: var(--mui-color-text);
    }

    .menu {
      display: grid;
      gap: var(--mui-space-1);
    }

    button {
      min-height: 34px;
      display: grid;
      grid-template-columns: 20px minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--mui-space-3);
      width: 100%;
      padding: 0 var(--mui-space-3);
      border: 0;
      border-radius: var(--mui-radius-md);
      background: transparent;
      color: var(--mui-color-text);
      font: inherit;
      font-size: var(--mui-text-md);
      text-align: left;
      cursor: pointer;
    }

    button:hover,
    button:focus-visible {
      outline: none;
      background: var(--mui-color-surface-hover);
    }

    button.danger {
      color: var(--mui-color-danger);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .label {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .shortcut {
      color: var(--mui-color-text-muted);
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
    }
  `;

  private select(item: MenuItem): void {
    if (item.disabled) return;
    this.emit('item-select', item, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <div class="menu" part="menu" role="menu" aria-label=${this.label}>
        ${(this.items ?? []).map((item) => html`
          <button
            part="item"
            role="menuitem"
            class=${item.danger ? 'danger' : ''}
            ?disabled=${Boolean(item.disabled)}
            @click=${() => this.select(item)}
          >
            <span>${item.icon ? html`<mui-icon name=${item.icon} size="16"></mui-icon>` : ''}</span>
            <span class="label">${item.label}</span>
            <span class="shortcut">${item.shortcut ?? ''}</span>
          </button>
        `)}
      </div>
    `;
  }
}

if (!customElements.get('mui-menu')) {
  customElements.define('mui-menu', MuiMenu);
}
