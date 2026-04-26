import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiButton extends MiuraElement {
  static properties = {
    variant: { type: String, default: 'primary', reflect: true },
    size: { type: String, default: 'md', reflect: true },
    loading: { type: Boolean, default: false, reflect: true },
    disabled: { type: Boolean, default: false, reflect: true },
    block: { type: Boolean, default: false, reflect: true },
    type: { type: String, default: 'button' },
  };

  declare variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  declare size: 'sm' | 'md' | 'lg';
  declare loading: boolean;
  declare disabled: boolean;
  declare block: boolean;
  declare type: 'button' | 'submit' | 'reset';

  static styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
      font-family: var(--mui-font-sans);
      --_height: var(--mui-control-height-md);
      --_px: var(--mui-space-5);
      --_font: var(--mui-text-md);
    }

    :host([block]) {
      display: flex;
      width: 100%;
    }

    :host([size="sm"]) {
      --_height: var(--mui-control-height-sm);
      --_px: var(--mui-space-4);
      --_font: var(--mui-text-sm);
    }

    :host([size="lg"]) {
      --_height: var(--mui-control-height-lg);
      --_px: var(--mui-space-6);
      --_font: var(--mui-text-lg);
    }

    button {
      appearance: none;
      border: 1px solid transparent;
      border-radius: var(--mui-radius-md);
      min-height: var(--_height);
      width: 100%;
      padding: 0 var(--_px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--mui-space-3);
      font: inherit;
      font-size: var(--_font);
      font-weight: var(--mui-weight-medium);
      background: var(--mui-color-accent);
      color: #fff;
      cursor: pointer;
      transition: background var(--mui-duration-fast), border-color var(--mui-duration-fast), color var(--mui-duration-fast), transform var(--mui-duration-fast), box-shadow var(--mui-duration-fast);
      user-select: none;
    }

    button:hover {
      background: var(--mui-color-accent-hover);
    }

    button:active {
      transform: translateY(1px);
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--mui-focus-ring);
    }

    :host([variant="secondary"]) button {
      background: var(--mui-color-surface);
      border-color: var(--mui-color-border);
      color: var(--mui-color-text);
    }

    :host([variant="secondary"]) button:hover {
      background: var(--mui-color-surface-hover);
    }

    :host([variant="ghost"]) button {
      background: transparent;
      color: var(--mui-color-text-muted);
    }

    :host([variant="ghost"]) button:hover {
      background: var(--mui-color-surface-hover);
      color: var(--mui-color-text);
    }

    :host([variant="danger"]) button {
      background: var(--mui-color-danger);
      color: #fff;
    }

    button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: var(--mui-radius-pill);
      animation: spin 700ms linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      button,
      .spinner {
        transition: none;
        animation: none;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  template() {
    const disabled = this.disabled || this.loading;

    return html`
      <button part="control" type=${this.type} ?disabled=${disabled} aria-busy=${this.loading ? 'true' : 'false'}>
        ${this.loading ? html`<span class="spinner" part="spinner"></span>` : html`<slot name="icon-start"></slot>`}
        <slot></slot>
        ${this.loading ? '' : html`<slot name="icon-end"></slot>`}
      </button>
    `;
  }
}

if (!customElements.get('mui-button')) {
  customElements.define('mui-button', MuiButton);
}
