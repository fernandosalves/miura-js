/**
 * MUI Badge Component
 * 
 * Displays a small badge for status indicators, counts, or labels.
 * 
 * @example
 * ```html
 * <mui-badge>New</mui-badge>
 * <mui-badge variant="solid" color="success">Published</mui-badge>
 * <mui-badge dot color="success"></mui-badge>
 * <mui-badge icon="check" color="success">Done</mui-badge>
 * ```
 */

import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

@component({ tag: 'mui-badge' })
export class MuiBadge extends MiuraElement {
  /**
   * Badge variant
   */
  @property({ type: String })
  variant: 'solid' | 'soft' | 'outline' | 'dot' = 'soft';

  /**
   * Badge color
   */
  @property({ type: String })
  color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' = 'default';

  /**
   * Badge size
   */
  @property({ type: String })
  size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Icon to display before label (Lucide icon name)
   */
  @property({ type: String })
  icon = '';

  /**
   * Display as dot only (no content)
   */
  @property({ type: Boolean })
  dot = false;

  /**
   * Numeric count (auto-formats large numbers)
   */
  @property({ type: Number })
  count: number | null = null;

  /**
   * Maximum count before showing "99+"
   */
  @property({ type: Number })
  max = 99;

  /**
   * Pill shape (fully rounded)
   */
  @property({ type: Boolean })
  pill = true;

  static styles = css`
    :host {
      display: inline-flex;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-family: inherit;
      font-weight: 500;
      white-space: nowrap;
      border: 1px solid transparent;
      transition: all var(--mui-duration-fast, 100ms) ease;
    }

    /* Sizes */
    .badge.size-sm {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 4px;
      min-height: 18px;
    }

    .badge.size-md {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 6px;
      min-height: 22px;
    }

    .badge.size-lg {
      font-size: 14px;
      padding: 4px 12px;
      border-radius: 8px;
      min-height: 28px;
    }

    .badge.pill {
      border-radius: 999px;
    }

    /* Dot variant */
    .badge.dot {
      width: 8px;
      height: 8px;
      min-height: auto;
      padding: 0;
      border-radius: 50%;
    }

    .badge.dot.size-sm { width: 6px; height: 6px; }
    .badge.dot.size-lg { width: 10px; height: 10px; }

    /* Soft variant (default) */
    .badge.variant-soft {
      background: var(--badge-soft-bg);
      color: var(--badge-color);
    }

    /* Solid variant */
    .badge.variant-solid {
      background: var(--badge-solid-bg);
      color: white;
    }

    /* Outline variant */
    .badge.variant-outline {
      background: transparent;
      border-color: var(--badge-border);
      color: var(--badge-color);
    }

    /* Dot variant colors */
    .badge.variant-dot {
      background: var(--badge-solid-bg);
    }

    /* Color: Default */
    .badge.color-default {
      --badge-soft-bg: var(--mui-surface-subtle, #f3f4f6);
      --badge-solid-bg: var(--mui-text-secondary, #6b7280);
      --badge-border: var(--mui-border, #e5e7eb);
      --badge-color: var(--mui-text-secondary, #6b7280);
    }

    /* Color: Primary */
    .badge.color-primary {
      --badge-soft-bg: rgba(59, 130, 246, 0.1);
      --badge-solid-bg: var(--mui-primary, #3b82f6);
      --badge-border: rgba(59, 130, 246, 0.4);
      --badge-color: var(--mui-primary, #3b82f6);
    }

    /* Color: Success */
    .badge.color-success {
      --badge-soft-bg: rgba(34, 197, 94, 0.1);
      --badge-solid-bg: var(--mui-success, #22c55e);
      --badge-border: rgba(34, 197, 94, 0.4);
      --badge-color: var(--mui-success, #16a34a);
    }

    /* Color: Warning */
    .badge.color-warning {
      --badge-soft-bg: rgba(245, 158, 11, 0.1);
      --badge-solid-bg: var(--mui-warning, #f59e0b);
      --badge-border: rgba(245, 158, 11, 0.4);
      --badge-color: var(--mui-warning, #d97706);
    }

    /* Color: Error */
    .badge.color-error {
      --badge-soft-bg: rgba(239, 68, 68, 0.1);
      --badge-solid-bg: var(--mui-error, #ef4444);
      --badge-border: rgba(239, 68, 68, 0.4);
      --badge-color: var(--mui-error, #dc2626);
    }

    /* Color: Info */
    .badge.color-info {
      --badge-soft-bg: rgba(14, 165, 233, 0.1);
      --badge-solid-bg: var(--mui-info, #0ea5e9);
      --badge-border: rgba(14, 165, 233, 0.4);
      --badge-color: var(--mui-info, #0284c7);
    }

    /* Icon styling */
    mui-icon {
      flex-shrink: 0;
    }
  `;

  private _formatCount(): string {
    if (this.count === null) return '';
    if (this.count > this.max) return `${this.max}+`;
    return String(this.count);
  }

  template() {
    const displayCount = this._formatCount();
    const isDot = this.dot || this.variant === 'dot';

    const classes = [
      'badge',
      `variant-${isDot ? 'dot' : this.variant}`,
      `color-${this.color}`,
      `size-${this.size}`,
      isDot ? 'dot' : '',
      this.pill ? 'pill' : '',
    ].filter(Boolean).join(' ');

    // Icon size based on badge size
    const iconSize = this.size === 'sm' ? 'xs' as const : 'sm' as const;

    if (isDot) {
      return html`<span class="${classes}"></span>`;
    }

    return html`
      <span class="${classes}">
        ${this.icon ? html`<mui-icon name="${this.icon}" size="${iconSize}"></mui-icon>` : ''}
        ${displayCount || html`<slot></slot>`}
      </span>
    `;
  }
}

export default MuiBadge;
