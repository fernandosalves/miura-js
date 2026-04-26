import { MiuraElement, css, html } from '@miurajs/miura-element';

export interface ListItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  badge?: string;
  disabled?: boolean;
}

export class MuiList extends MiuraElement {
  static properties = {
    items: { type: Array, default: () => [] },
    active: { type: String, default: '' },
  };

  declare items: ListItem[];
  declare active: string;

  static styles = css`
    :host {
      display: block;
      font-family: var(--mui-font-sans);
      color: var(--mui-color-text);
    }

    .list {
      display: grid;
      gap: var(--mui-space-2);
    }

    button {
      display: grid;
      grid-template-columns: 28px minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--mui-space-3);
      width: 100%;
      padding: var(--mui-space-3);
      border: 1px solid transparent;
      border-radius: var(--mui-radius-lg);
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    button:hover,
    button:focus-visible {
      outline: none;
      background: var(--mui-color-surface-hover);
    }

    button.active {
      border-color: var(--mui-color-border);
      background: var(--mui-color-accent-muted);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .title {
      font-weight: var(--mui-weight-medium);
    }

    .description {
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
      margin-top: 2px;
    }
  `;

  private select(item: ListItem): void {
    if (item.disabled) return;
    this.active = item.id;
    this.emit('item-select', item, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <div class="list" part="list">
        ${(this.items ?? []).map((item) => html`
          <button class=${item.id === this.active ? 'active' : ''} ?disabled=${Boolean(item.disabled)} @click=${() => this.select(item)}>
            <span>${item.icon ? html`<mui-icon name=${item.icon}></mui-icon>` : ''}</span>
            <span>
              <span class="title">${item.title}</span>
              ${item.description ? html`<div class="description">${item.description}</div>` : ''}
            </span>
            ${item.badge ? html`<mui-badge tone="accent">${item.badge}</mui-badge>` : ''}
          </button>
        `)}
      </div>
    `;
  }
}

if (!customElements.get('mui-list')) {
  customElements.define('mui-list', MuiList);
}
