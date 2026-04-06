import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Pagination component for navigating through pages
 * Usage:
 * <mui-pagination 
 *   current-page="1" 
 *   total-pages="10"
 *   @page-change=${(e) => console.log(e.detail.page)}
 * ></mui-pagination>
 */
@component({ tag: 'mui-pagination' })
export class MuiPagination extends MiuraElement {
  @property({ type: Number, default: 1 })
  currentPage!: number;

  @property({ type: Number, default: 1 })
  totalPages!: number;

  @property({ type: Number, default: 7 })
  maxVisible!: number;

  @property({ type: Boolean, default: false })
  showFirstLast!: boolean;

  @property({ type: Boolean, default: true })
  showPrevNext!: boolean;

  @property({ type: String, default: 'md' })
  size!: 'sm' | 'md' | 'lg';

  @property({ type: Boolean, default: false })
  disabled!: boolean;

  static get styles() {
    return css`
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--mui-space-1);
        font-size: var(--mui-text-sm);
      }

      .page-button {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: var(--_button-size, 40px);
        height: var(--_button-size, 40px);
        padding: 0 var(--mui-space-2);
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
        color: var(--mui-text);
        font-size: var(--mui-text-sm);
        font-weight: var(--mui-weight-medium);
        cursor: pointer;
        transition: all var(--mui-duration-fast) var(--mui-easing-standard);
        user-select: none;
      }

      .page-button:hover:not(:disabled):not(.active) {
        background: var(--mui-surface-hover);
        border-color: var(--mui-border-hover);
        transform: translateY(-1px);
      }

      .page-button:focus-visible {
        outline: 2px solid var(--mui-primary);
        outline-offset: 2px;
      }

      .page-button:active:not(:disabled) {
        transform: scale(0.95);
      }

      .page-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .page-button.active {
        background: var(--mui-primary);
        border-color: var(--mui-primary);
        color: var(--mui-primary-foreground);
        cursor: default;
      }

      .page-button svg {
        width: 16px;
        height: 16px;
      }

      .ellipsis {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: var(--_button-size, 36px);
        height: var(--_button-size, 36px);
        color: var(--mui-text-secondary);
        user-select: none;
      }

      /* Size variants */
      :host([size="sm"]) {
        --_button-size: 32px;
        font-size: var(--mui-text-xs);
      }

      :host([size="lg"]) {
        --_button-size: 44px;
        font-size: var(--mui-text-md);
      }

      /* Disabled state */
      :host([disabled]) {
        opacity: 0.6;
        pointer-events: none;
      }
    `;
  }

  private _goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage || this.disabled) {
      return;
    }

    this.currentPage = page;
    this.emit('page-change', { page });
  }

  private _getVisiblePages(): (number | 'ellipsis')[] {
    const { currentPage, totalPages, maxVisible } = this;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisible / 2);
    
    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let start = Math.max(2, currentPage - halfVisible);
    let end = Math.min(totalPages - 1, currentPage + halfVisible);

    // Adjust if at boundaries
    if (currentPage <= halfVisible + 1) {
      end = Math.min(totalPages - 1, maxVisible - 1);
    } else if (currentPage >= totalPages - halfVisible) {
      start = Math.max(2, totalPages - maxVisible + 2);
    }

    // Add left ellipsis
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add right ellipsis
    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }

  template() {
    const { currentPage, totalPages, showFirstLast, showPrevNext, disabled } = this;
    const pages = this._getVisiblePages();

    const prevIcon = html`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    `;

    const nextIcon = html`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    `;

    const firstIcon = html`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 18l-6-6 6-6M12 18l-6-6 6-6"/>
      </svg>
    `;

    const lastIcon = html`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 18l6-6-6-6M12 18l6-6-6-6"/>
      </svg>
    `;

    return html`
      ${showFirstLast ? html`
        <button
          class="page-button"
          @click=${() => this._goToPage(1)}
          ?disabled=${currentPage === 1 || disabled}
          aria-label="First page"
        >
          ${firstIcon}
        </button>
      ` : ''}

      ${showPrevNext ? html`
        <button
          class="page-button"
          @click=${() => this._goToPage(currentPage - 1)}
          ?disabled=${currentPage === 1 || disabled}
          aria-label="Previous page"
        >
          ${prevIcon}
        </button>
      ` : ''}

      ${pages.map(page => {
        if (page === 'ellipsis') {
          return html`<span class="ellipsis">...</span>`;
        }

        return html`
          <button
            class="page-button ${page === currentPage ? 'active' : ''}"
            @click=${() => this._goToPage(page as number)}
            ?disabled=${disabled}
            aria-label="Page ${page}"
            aria-current=${page === currentPage ? 'page' : undefined}
          >
            ${page}
          </button>
        `;
      })}

      ${showPrevNext ? html`
        <button
          class="page-button"
          @click=${() => this._goToPage(currentPage + 1)}
          ?disabled=${currentPage === totalPages || disabled}
          aria-label="Next page"
        >
          ${nextIcon}
        </button>
      ` : ''}

      ${showFirstLast ? html`
        <button
          class="page-button"
          @click=${() => this._goToPage(totalPages)}
          ?disabled=${currentPage === totalPages || disabled}
          aria-label="Last page"
        >
          ${lastIcon}
        </button>
      ` : ''}
    `;
  }
}
