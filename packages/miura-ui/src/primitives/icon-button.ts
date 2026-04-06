/**
 * MUI Icon Button Component
 * 
 * A button that displays only an icon. Useful for toolbars, actions, and compact UIs.
 * 
 * @example
 * ```html
 * <mui-icon-button icon="settings"></mui-icon-button>
 * <mui-icon-button icon="trash-2" variant="ghost" color="error"></mui-icon-button>
 * <mui-icon-button icon="plus" size="lg" variant="primary"></mui-icon-button>
 * ```
 */

import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

@component({ tag: 'mui-icon-button' })
export class MuiIconButton extends MiuraElement {
  /**
   * Lucide icon name
   */
  @property({ type: String })
  icon = '';

  /**
   * Button variant
   */
  @property({ type: String })
  variant: 'solid' | 'outline' | 'ghost' | 'soft' = 'ghost';

  /**
   * Color scheme
   */
  @property({ type: String })
  color: 'default' | 'primary' | 'success' | 'warning' | 'error' = 'default';

  /**
   * Size
   */
  @property({ type: String })
  size: 'xs' | 'sm' | 'md' | 'lg' = 'md';

  /**
   * Disabled state
   */
  @property({ type: Boolean })
  disabled = false;

  /**
   * Loading state (shows spinner)
   */
  @property({ type: Boolean })
  loading = false;

  /**
   * Accessible label (required for icon-only buttons)
   */
  @property({ type: String })
  label = '';

  /**
   * Make the button round (circular)
   */
  @property({ type: Boolean })
  round = false;

  static styles = css`
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      font-family: inherit;
      transition: all var(--mui-duration-fast, 100ms) var(--mui-easing-standard, ease);
      border-radius: var(--mui-radius-md, 6px);
      background: transparent;
      color: var(--mui-text, #1f2937);
      position: relative;
      overflow: hidden;
    }

    button:focus-visible {
      outline: 2px solid var(--mui-primary, #3b82f6);
      outline-offset: 2px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Sizes */
    button.size-xs {
      width: 24px;
      height: 24px;
    }

    button.size-sm {
      width: 32px;
      height: 32px;
    }

    button.size-md {
      width: 36px;
      height: 36px;
    }

    button.size-lg {
      width: 44px;
      height: 44px;
    }

    /* Round */
    button.round {
      border-radius: 50%;
    }

    /* Ghost Variant */
    button.variant-ghost {
      background: transparent;
    }

    button.variant-ghost:hover {
      background: var(--mui-surface-hover, rgba(0, 0, 0, 0.04));
    }

    button.variant-ghost:active {
      background: var(--mui-surface-active, rgba(0, 0, 0, 0.08));
    }

    /* Soft Variant */
    button.variant-soft {
      background: var(--button-soft-bg);
      color: var(--button-color);
    }

    button.variant-soft:hover {
      background: var(--button-soft-hover);
    }

    /* Outline Variant */
    button.variant-outline {
      background: transparent;
      border: 1px solid var(--mui-border, #e5e7eb);
    }

    button.variant-outline:hover {
      background: var(--mui-surface-hover, rgba(0, 0, 0, 0.04));
      border-color: var(--mui-border-strong, #d1d5db);
    }

    /* Solid Variant */
    button.variant-solid {
      background: var(--button-solid-bg);
      color: white;
    }

    button.variant-solid:hover {
      background: var(--button-solid-hover);
    }

    /* Color: Default */
    button.color-default {
      --button-soft-bg: var(--mui-surface-subtle, #f3f4f6);
      --button-soft-hover: var(--mui-surface-hover, #e5e7eb);
      --button-solid-bg: var(--mui-text, #1f2937);
      --button-solid-hover: #374151;
      --button-color: var(--mui-text, #1f2937);
    }

    button.color-default.variant-ghost:hover {
      color: var(--mui-text, #1f2937);
    }

    /* Color: Primary */
    button.color-primary {
      --button-soft-bg: rgba(59, 130, 246, 0.1);
      --button-soft-hover: rgba(59, 130, 246, 0.15);
      --button-solid-bg: var(--mui-primary, #3b82f6);
      --button-solid-hover: var(--mui-primary-hover, #2563eb);
      --button-color: var(--mui-primary, #3b82f6);
    }

    button.color-primary.variant-ghost {
      color: var(--mui-primary, #3b82f6);
    }

    /* Color: Success */
    button.color-success {
      --button-soft-bg: rgba(34, 197, 94, 0.1);
      --button-soft-hover: rgba(34, 197, 94, 0.15);
      --button-solid-bg: var(--mui-success, #22c55e);
      --button-solid-hover: #16a34a;
      --button-color: var(--mui-success, #22c55e);
    }

    button.color-success.variant-ghost {
      color: var(--mui-success, #22c55e);
    }

    /* Color: Warning */
    button.color-warning {
      --button-soft-bg: rgba(245, 158, 11, 0.1);
      --button-soft-hover: rgba(245, 158, 11, 0.15);
      --button-solid-bg: var(--mui-warning, #f59e0b);
      --button-solid-hover: #d97706;
      --button-color: var(--mui-warning, #f59e0b);
    }

    button.color-warning.variant-ghost {
      color: var(--mui-warning, #f59e0b);
    }

    /* Color: Error */
    button.color-error {
      --button-soft-bg: rgba(239, 68, 68, 0.1);
      --button-soft-hover: rgba(239, 68, 68, 0.15);
      --button-solid-bg: var(--mui-error, #ef4444);
      --button-solid-hover: #dc2626;
      --button-color: var(--mui-error, #ef4444);
    }

    button.color-error.variant-ghost {
      color: var(--mui-error, #ef4444);
    }

    /* Loading spinner overlay */
    .loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: inherit;
    }

    .icon-hidden {
      visibility: hidden;
    }
  `;

  private _getIconSize(): 'xs' | 'sm' | 'md' | 'lg' {
    const sizeMap: Record<string, 'xs' | 'sm' | 'md' | 'lg'> = {
      xs: 'xs',
      sm: 'sm', 
      md: 'sm',
      lg: 'md',
    };
    return sizeMap[this.size] || 'sm';
  }

  template() {
    const classes = [
      `variant-${this.variant}`,
      `color-${this.color}`,
      `size-${this.size}`,
      this.round ? 'round' : '',
    ].filter(Boolean).join(' ');

    return html`
      <button
        class="${classes}"
        ?disabled="${this.disabled || this.loading}"
        aria-label="${this.label || this.icon}"
        aria-busy="${this.loading}"
        type="button"
      >
        <mui-icon 
          name="${this.loading ? 'loader-2' : this.icon}" 
          size="${this._getIconSize()}"
          ?spin="${this.loading}"
          class="${this.loading ? '' : ''}"
        ></mui-icon>
      </button>
    `;
  }
}

export default MuiIconButton;
