import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Form Field Wrapper — label + helper/error text around any input
 *
 * <mui-field label="Email" required helper="We'll never share your email">
 *   <mui-input type="email"></mui-input>
 * </mui-field>
 */
@component({ tag: 'mui-field' })
export class MuiField extends MiuraElement {
  @property({ type: String, default: '' })
  label!: string;

  @property({ type: String, default: '' })
  helper!: string;

  @property({ type: String, default: '' })
  error!: string;

  @property({ type: Boolean, default: false, reflect: true })
  required!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  static styles: any = css`
    :host { display: block; }

    .field { display: flex; flex-direction: column; gap: var(--mui-space-1, 4px); }

    .label-row {
      display: flex;
      align-items: center;
      gap: var(--mui-space-1, 4px);
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: var(--mui-weight-medium, 500);
      color: var(--mui-text, #1f2937);
    }

    :host([disabled]) .label-row { color: var(--mui-text-muted, #9ca3af); }

    .required-star {
      color: var(--mui-error, #ef4444);
      font-size: 0.875em;
    }

    .helper {
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-secondary, #6b7280);
      line-height: 1.4;
    }

    .error-msg {
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-error, #ef4444);
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `;

  template() {
    return html`
      <div class="field">
        ${this.label ? html`
          <label class="label-row">
            ${this.label}
            ${this.required ? html`<span class="required-star" aria-hidden="true">*</span>` : ''}
          </label>
        ` : ''}
        <slot></slot>
        ${this.error ? html`
          <div class="error-msg" role="alert">
            <mui-icon name="alert-circle" size="xs"></mui-icon>
            ${this.error}
          </div>
        ` : (this.helper ? html`<div class="helper">${this.helper}</div>` : '')}
      </div>
    `;
  }
}
