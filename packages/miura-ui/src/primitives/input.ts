import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Text Input component
 * <mui-input placeholder="Search..." clearable prefix-icon="search"></mui-input>
 */
@component({ tag: 'mui-input' })
export class MuiInput extends MiuraElement {
  @property({ type: String, default: '' })
  value!: string;

  @property({ type: String, default: 'text', reflect: true })
  type!: string;

  @property({ type: String, default: '' })
  placeholder!: string;

  @property({ type: String, default: 'md', reflect: true })
  size!: 'sm' | 'md' | 'lg';

  @property({ type: String, default: 'default', reflect: true })
  status!: 'default' | 'error' | 'success' | 'warning';

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  readonly!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  loading!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  clearable!: boolean;

  @property({ type: String, default: '' })
  prefixIcon!: string;

  @property({ type: String, default: '' })
  suffixIcon!: string;

  static styles: any = css`
    :host {
      display: inline-block;
      width: 100%;
      --mui-input-height: 38px;
    }

    :host([size="sm"]) { --mui-input-height: 32px; --_fs: var(--mui-text-xs, 0.75rem); }
    :host([size="md"]) { --mui-input-height: 38px; --_fs: var(--mui-text-sm, 0.875rem); }
    :host([size="lg"]) { --mui-input-height: 46px; --_fs: var(--mui-text-md, 1rem); }

    .wrapper {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2, 8px);
      padding: 0 var(--mui-space-3, 12px);
      background: var(--mui-surface, #fff);
      border: 1px solid var(--mui-border, #e5e7eb);
      border-radius: var(--mui-radius-md, 6px);
      height: var(--mui-input-height);
      transition: border-color var(--mui-duration-fast, 100ms) ease,
                  box-shadow var(--mui-duration-fast, 100ms) ease;
      position: relative;
      cursor: text;
    }

    .wrapper:focus-within {
      border-color: var(--mui-primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    :host([status="error"]) .wrapper { border-color: var(--mui-error, #ef4444); }
    :host([status="success"]) .wrapper { border-color: var(--mui-success, #22c55e); }

    :host([disabled]) .wrapper {
      background: var(--mui-surface-subtle, #f9fafb);
      opacity: 0.6;
      cursor: not-allowed;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-family: inherit;
      font-size: var(--_fs);
      color: var(--mui-text, #1f2937);
      padding: 0;
      width: 100%;
      height: 100%;
    }

    input::placeholder { color: var(--mui-text-muted, #9ca3af); }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mui-text-secondary, #6b7280);
      flex-shrink: 0;
    }

    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      border: none;
      background: transparent;
      border-radius: 50%;
      color: var(--mui-text-muted, #9ca3af);
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s, background 0.2s, color 0.2s;
    }

    .clear-btn:hover { background: var(--mui-surface-hover, rgba(0,0,0,0.04)); color: var(--mui-text, #1f2937); }
    :host(:hover) .clear-btn.visible { opacity: 1; pointer-events: auto; }

    /* Loading spinner */
    .loader {
      width: 16px;
      height: 16px;
      border: 2px solid var(--mui-border, #e5e7eb);
      border-top-color: var(--mui-primary, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  private _handleInput(e: Event) {
    if (this.disabled || this.readonly) return;
    this.value = (e.target as HTMLInputElement).value;
    this.emit('change', { value: this.value });
    this.requestUpdate();
  }

  private _clear() {
    this.value = '';
    this.emit('change', { value: '' });
    const input = this.shadowRoot.querySelector('input');
    input?.focus();
    this.requestUpdate();
  }

  template() {
    const showClear = this.clearable && this.value && !this.disabled && !this.readonly;

    return html`
      <div class="wrapper" part="wrapper" @click=${() => this.shadowRoot.querySelector('input')?.focus()}>
        <slot name="prefix">
          ${this.prefixIcon ? html`<mui-icon name="${this.prefixIcon}" size="sm" class="icon"></mui-icon>` : ''}
        </slot>

        <input
          placeholder="${this.placeholder}"
          .value=${this.value}
          type="${this.type}"
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @input=${(e: Event) => this._handleInput(e)}
        />

        <div class="icon-group">
          ${this.loading ? html`<div class="loader"></div>` : html`
            <slot name="suffix">
              ${showClear ? html`
                <button class="clear-btn visible" @click=${(e: Event) => { e.stopPropagation(); this._clear(); }} aria-label="Clear">
                  <mui-icon name="x" size="xs"></mui-icon>
                </button>
              ` : ''}
              ${this.suffixIcon && !showClear ? html`<mui-icon name="${this.suffixIcon}" size="sm" class="icon"></mui-icon>` : ''}
            </slot>
          `}
        </div>
      </div>
    `;
  }
}


