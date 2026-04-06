import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Button component
 * <mui-button variant="solid" tone="primary">Click me</mui-button>
 */
@component({ tag: 'mui-button' })
export class MuiButton extends MiuraElement {
  @property({ type: String, default: 'solid', reflect: true })
  variant!: 'solid' | 'soft' | 'outline' | 'ghost';

  @property({ type: String, default: 'md', reflect: true })
  size!: 'sm' | 'md' | 'lg';

  @property({ type: String, default: 'primary', reflect: true })
  tone!: 'primary' | 'secondary' | 'danger' | 'neutral';

  @property({ type: Boolean, default: false, reflect: true })
  loading!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  block!: boolean;

  static styles: any = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      --_h: 38px;
      --_px: 16px;
      --_fs: 14px;
      --_gap: 8px;
    }

    :host([block]) { display: block; width: 100%; }

    :host([size="sm"]) { --_h: 32px; --_px: 12px; --_fs: 13px; --_gap: 6px; }
    :host([size="lg"]) { --_h: 46px; --_px: 20px; --_fs: 16px; --_gap: 10px; }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--_gap);
      height: var(--_h);
      padding: 0 var(--_px);
      border-radius: var(--mui-radius-md, 6px);
      font-family: inherit;
      font-size: var(--_fs);
      font-weight: var(--mui-weight-medium, 500);
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
      width: 100%;
      white-space: nowrap;
      user-select: none;
      position: relative;
      outline: none;
      background: none;
      color: inherit;
    }

    button:active { transform: scale(0.97); }

    /* Solid */
    :host([variant="solid"][tone="primary"]) button { background: var(--mui-primary, #3b82f6); color: white; }
    :host([variant="solid"][tone="primary"]) button:hover { background: #2563eb; }
    
    :host([variant="solid"][tone="secondary"]) button { background: var(--mui-secondary, #64748b); color: white; }
    :host([variant="solid"][tone="secondary"]) button:hover { background: #475569; }

    :host([variant="solid"][tone="danger"]) button { background: var(--mui-error, #ef4444); color: white; }
    :host([variant="solid"][tone="danger"]) button:hover { background: #dc2626; }

    /* Outline */
    :host([variant="outline"]) button { background: transparent; border-color: var(--mui-border, #e5e7eb); color: var(--mui-text, #1f2937); }
    :host([variant="outline"]) button:hover { background: var(--mui-surface-subtle, #f9fafb); border-color: var(--mui-border-strong, #d1d5db); }
    
    /* Ghost */
    :host([variant="ghost"]) button { background: transparent; color: var(--mui-text-secondary, #6b7280); }
    :host([variant="ghost"]) button:hover { background: var(--mui-surface-hover, rgba(0,0,0,0.04)); color: var(--mui-text, #1f2937); }

    /* states */
    button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    
    .loader {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  template() {
    const isDisabled = this.disabled || this.loading;
    return html`
      <button ?disabled=${isDisabled} aria-busy=${this.loading} part="button">
        ${this.loading ? html`<div class="loader"></div>` : ''}
        ${!this.loading ? html`<slot name="icon-start"></slot>` : ''}
        <slot></slot>
        ${!this.loading ? html`<slot name="icon-end"></slot>` : ''}
      </button>
    `;
  }
}
