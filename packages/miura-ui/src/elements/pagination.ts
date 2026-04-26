import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiPagination extends MiuraElement {
  static properties = {
    page: { type: Number, default: 1 },
    total: { type: Number, default: 1 },
  };

  declare page: number;
  declare total: number;

  static styles = css`
    :host {
      display: inline-flex;
      font-family: var(--mui-font-sans);
    }

    nav {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
    }

    button {
      min-width: 32px;
      height: 32px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      cursor: pointer;
      font: inherit;
    }

    button:hover,
    button:focus-visible {
      outline: none;
      border-color: var(--mui-color-accent);
      box-shadow: var(--mui-focus-ring);
    }

    button.active {
      background: var(--mui-color-accent);
      border-color: var(--mui-color-accent);
      color: #fff;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `;

  private setPage(page: number): void {
    const next = Math.max(1, Math.min(this.total, page));
    if (next === this.page) return;
    this.page = next;
    this.emit('change', { page: this.page }, { bubbles: true, composed: true });
  }

  template() {
    const pages = Array.from({ length: Math.max(1, this.total) }, (_, index) => index + 1);

    return html`
      <nav part="nav" aria-label="Pagination">
        <button ?disabled=${this.page <= 1} @click=${() => this.setPage(this.page - 1)} aria-label="Previous page">
          <mui-icon name="chevron-left" size="16"></mui-icon>
        </button>
        ${pages.map((page) => html`
          <button class=${page === this.page ? 'active' : ''} aria-current=${page === this.page ? 'page' : 'false'} @click=${() => this.setPage(page)}>${page}</button>
        `)}
        <button ?disabled=${this.page >= this.total} @click=${() => this.setPage(this.page + 1)} aria-label="Next page">
          <mui-icon name="chevron-right" size="16"></mui-icon>
        </button>
      </nav>
    `;
  }
}

if (!customElements.get('mui-pagination')) {
  customElements.define('mui-pagination', MuiPagination);
}
