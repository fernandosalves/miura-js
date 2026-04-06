/**
 * MUI Breadcrumb Component
 * 
 * Navigation breadcrumbs for showing page hierarchy.
 * 
 * @example
 * ```html
 * <mui-breadcrumb>
 *   <mui-breadcrumb-item href="/">Home</mui-breadcrumb-item>
 *   <mui-breadcrumb-item href="/content">Content</mui-breadcrumb-item>
 *   <mui-breadcrumb-item active>Editor</mui-breadcrumb-item>
 * </mui-breadcrumb>
 * ```
 */

import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

@component({ tag: 'mui-breadcrumb' })
export default class MuiBreadcrumb extends MiuraElement {
  /**
   * Custom separator character
   */
  @property({ type: String })
  separator = '';

  /**
   * Maximum items to show before collapsing
   */
  @property({ type: Number, attribute: 'max-items' })
  maxItems = 0;

  /**
   * Where to collapse items
   */
  @property({ type: String })
  collapse: 'start' | 'middle' | 'end' = 'middle';

  /**
   * Size variant
   */
  @property({ type: String })
  size: 'sm' | 'md' = 'md';

  @state()
  private _expanded = false;

  static styles = css`
    :host {
      display: block;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--mui-space-1, 4px);
    }

    .breadcrumb.size-sm {
      font-size: var(--mui-text-xs, 0.75rem);
    }

    .breadcrumb.size-md {
      font-size: var(--mui-text-sm, 0.875rem);
    }

    .separator {
      color: var(--mui-text-muted, #9ca3af);
      display: flex;
      align-items: center;
      user-select: none;
    }

    .ellipsis {
      display: flex;
      align-items: center;
      gap: var(--mui-space-1, 4px);
    }

    .ellipsis-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 8px;
      border: none;
      background: var(--mui-surface-subtle, #f3f4f6);
      border-radius: var(--mui-radius-sm, 4px);
      color: var(--mui-text-secondary, #6b7280);
      cursor: pointer;
      font-size: inherit;
      line-height: 1;
    }

    .ellipsis-btn:hover {
      background: var(--mui-surface-hover, #e5e7eb);
    }
  `;

  template() {
    const classes = [
      'breadcrumb',
      `size-${this.size}`,
    ].join(' ');

    const separatorIcon = this.separator || html`<mui-icon name="chevron-right" size="xs"></mui-icon>`;

    return html`
      <nav class="${classes}" aria-label="Breadcrumb">
        <slot></slot>
      </nav>
    `;
  }

  // Note: Full implementation would handle slot changes to:
  // 1. Insert separators between items
  // 2. Handle collapse/expand for maxItems
  // 3. Track active state
}

@component({ tag: 'mui-breadcrumb-item' })
export class MuiBreadcrumbItem extends MiuraElement {
  /**
   * Navigation href
   */
  @property({ type: String })
  href = '';

  /**
   * Mark as current/active page
   */
  @property({ type: Boolean })
  active = false;

  /**
   * Icon name
   */
  @property({ type: String })
  icon = '';

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
    }

    :host(:not(:last-child))::after {
      content: '';
      display: inline-flex;
      align-items: center;
      margin: 0 var(--mui-space-2, 8px);
      color: var(--mui-text-muted, #9ca3af);
    }

    .item {
      display: inline-flex;
      align-items: center;
      gap: var(--mui-space-1, 4px);
      color: var(--mui-text-secondary, #6b7280);
      text-decoration: none;
      transition: color var(--mui-duration-fast, 100ms) ease;
    }

    a.item:hover {
      color: var(--mui-primary, #3b82f6);
    }

    .item.active {
      color: var(--mui-text, #1f2937);
      font-weight: 500;
      pointer-events: none;
    }

    .separator {
      color: var(--mui-text-muted, #9ca3af);
      margin: 0 var(--mui-space-2, 8px);
    }
  `;

  template() {
    const classes = ['item', this.active ? 'active' : ''].filter(Boolean).join(' ');
    const content = html`
      ${this.icon ? html`<mui-icon name="${this.icon}" size="xs"></mui-icon>` : ''}
      <slot></slot>
    `;

    return html`
      ${this.href && !this.active
        ? html`
            <a 
              class="${classes}" 
              href="${this.href}"
            >
              ${content}
            </a>
          `
        : html`
            <span 
              class="${classes}"
              aria-current="${this.active ? 'page' : 'false'}"
            >
              ${content}
            </span>
          `
      }
      ${!this.active ? html`
        <span class="separator">
          <mui-icon name="chevron-right" size="xs"></mui-icon>
        </span>
      ` : ''}
    `;
  }
}