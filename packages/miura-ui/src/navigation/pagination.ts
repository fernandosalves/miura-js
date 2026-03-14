import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-pagination page="1" pageCount="5"></mui-pagination>
 */
export class MuiPagination extends MiuraElement {
  static properties = {
    page: { type: Number },
    pageCount: { type: Number },
  };
  page = 1;
  pageCount = 1;

  _setPage(page: number) {
    if (page < 1 || page > this.pageCount) return;
    this.page = page;
    this.dispatchEvent(new CustomEvent('change', { detail: { page }, bubbles: true, composed: true }));
  }

  template() {
    return html`
      <nav class="mui-pagination">
        <button @click=${() => this._setPage(this.page - 1)} ?disabled=${this.page <= 1}>&lt;</button>
        ${Array.from({ length: this.pageCount }, (_, i) => html`
          <button
            class="${this.page === i + 1 ? 'active' : ''}"
            @click=${() => this._setPage(i + 1)}
          >${i + 1}</button>
        `)}
        <button @click=${() => this._setPage(this.page + 1)} ?disabled=${this.page >= this.pageCount}>&gt;</button>
      </nav>
    `;
  }

  styles = css`
    .mui-pagination {
      display: flex;
      gap: var(--mui-spacing-1);
      align-items: center;
    }
    button {
      background: none;
      border: 1px solid #ccc;
      border-radius: var(--mui-radius);
      padding: 0.25em 0.75em;
      cursor: pointer;
      font: inherit;
      transition: background 0.2s, border-color 0.2s;
    }
    button.active {
      background: var(--mui-primary, #0078d4);
      color: #fff;
      border-color: var(--mui-primary, #0078d4);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
}
customElements.define('mui-pagination', MuiPagination); 