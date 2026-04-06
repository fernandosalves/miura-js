import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Textarea — multiline text input
 *
 * <mui-textarea label="Description" rows="4" counter maxlength="500"></mui-textarea>
 */
@component({ tag: 'mui-textarea' })
export class MuiTextarea extends MiuraElement {
  @property({ type: String, default: '' })
  value!: string;

  @property({ type: String, default: '' })
  placeholder!: string;

  @property({ type: String, default: '' })
  label!: string;

  @property({ type: Number, default: 4 })
  rows!: number;

  @property({ type: Number, default: 0 })
  maxlength!: number;

  @property({ type: Boolean, default: false })
  counter!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  readonly!: boolean;

  @property({ type: String, default: 'error' })
  status!: 'default' | 'error' | 'success';

  @property({ type: String, default: 'vertical', reflect: true })
  resize!: 'none' | 'vertical' | 'horizontal' | 'both';

  static styles: any = css`
    :host { display: block; width: 100%; }

    .wrapper { display: flex; flex-direction: column; gap: var(--mui-space-1, 4px); }

    .label {
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: var(--mui-weight-medium, 500);
      color: var(--mui-text, #1f2937);
    }

    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: var(--mui-space-2, 8px) var(--mui-space-3, 12px);
      font-family: inherit;
      font-size: var(--mui-text-sm, 0.875rem);
      color: var(--mui-text, #1f2937);
      background: var(--mui-input-bg, var(--mui-surface, #fff));
      border: 1px solid var(--mui-input-border, var(--mui-border, #e5e7eb));
      border-radius: var(--mui-radius-md, 6px);
      outline: none;
      transition: border-color var(--mui-duration-fast, 100ms) ease,
                  box-shadow var(--mui-duration-fast, 100ms) ease;
      resize: var(--_resize, vertical);
      line-height: 1.5;
    }

    :host([resize="none"]) { --_resize: none; }
    :host([resize="horizontal"]) { --_resize: horizontal; }
    :host([resize="both"]) { --_resize: both; }

    textarea:focus {
      border-color: var(--mui-primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    textarea:disabled { opacity: 0.5; cursor: not-allowed; }

    .counter {
      text-align: right;
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-muted, #9ca3af);
    }
  `;

  private _handleInput(e: Event) {
    this.value = (e.target as HTMLTextAreaElement).value;
    this.emit('change', { value: this.value });
  }

  template() {
    return html`
      <div class="wrapper">
        ${this.label ? html`<label class="label">${this.label}</label>` : ''}
        <textarea
          placeholder="${this.placeholder}"
          rows="${this.rows}"
          .value="${this.value || ''}"
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          maxlength="${this.maxlength || ''}"
          @input=${(e: Event) => this._handleInput(e)}
        ></textarea>
        ${this.counter ? html`
          <div class="counter">${this.value.length}${this.maxlength ? `/${this.maxlength}` : ''}</div>
        ` : ''}
      </div>
    `;
  }
}
