import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiField extends MiuraElement {
  static properties = {
    label: { type: String, default: '' },
    help: { type: String, default: '' },
    error: { type: String, default: '' },
    required: { type: Boolean, default: false, reflect: true },
  };

  declare label: string;
  declare help: string;
  declare error: string;
  declare required: boolean;

  static styles = css`
    :host {
      display: grid;
      gap: var(--mui-space-2);
      font-family: var(--mui-font-sans);
      color: var(--mui-color-text);
    }

    label {
      font-size: var(--mui-text-sm);
      font-weight: var(--mui-weight-medium);
      color: var(--mui-color-text);
    }

    .required {
      color: var(--mui-color-danger);
    }

    .message {
      min-height: 1rem;
      font-size: var(--mui-text-xs);
      color: var(--mui-color-text-muted);
    }

    .message.error {
      color: var(--mui-color-danger);
    }
  `;

  template() {
    const message = this.error || this.help;

    return html`
      ${this.label ? html`<label part="label">${this.label}${this.required ? html` <span class="required">*</span>` : ''}</label>` : ''}
      <slot></slot>
      ${message ? html`<div part="message" class="message ${this.error ? 'error' : ''}">${message}</div>` : ''}
    `;
  }
}

if (!customElements.get('mui-field')) {
  customElements.define('mui-field', MuiField);
}
