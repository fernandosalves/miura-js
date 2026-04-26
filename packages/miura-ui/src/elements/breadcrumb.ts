import { MiuraElement, css, html } from '@miurajs/miura-element';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
}

export class MuiBreadcrumb extends MiuraElement {
  static properties = {
    items: { type: Array, default: () => [] },
  };

  declare items: BreadcrumbItem[];

  static styles = css`
    :host {
      display: block;
      font-family: var(--mui-font-sans);
      color: var(--mui-color-text-muted);
    }

    ol {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--mui-text-sm);
    }

    button,
    span {
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
    }

    button {
      cursor: pointer;
      border-radius: var(--mui-radius-sm);
      padding: var(--mui-space-1) var(--mui-space-2);
    }

    button:hover,
    button:focus-visible {
      outline: none;
      background: var(--mui-color-surface-hover);
      color: var(--mui-color-text);
    }

    .current {
      color: var(--mui-color-text);
      font-weight: var(--mui-weight-medium);
    }
  `;

  private select(item: BreadcrumbItem): void {
    this.emit('item-select', item, { bubbles: true, composed: true });
  }

  template() {
    const items = this.items ?? [];

    return html`
      <nav part="nav" aria-label="Breadcrumb">
        <ol>
          ${items.map((item, index) => {
            const current = index === items.length - 1;
            return html`
              <li>
                ${current ? html`<span class="current" aria-current="page">${item.label}</span>` : html`<button @click=${() => this.select(item)}>${item.label}</button>`}
              </li>
              ${current ? '' : html`<li aria-hidden="true">/</li>`}
            `;
          })}
        </ol>
      </nav>
    `;
  }
}

if (!customElements.get('mui-breadcrumb')) {
  customElements.define('mui-breadcrumb', MuiBreadcrumb);
}
