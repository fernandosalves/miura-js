import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiInput extends MiuraElement {
  static properties = {
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    type: { type: String, default: 'text' },
    disabled: { type: Boolean, default: false, reflect: true },
    invalid: { type: Boolean, default: false, reflect: true },
    name: { type: String, default: '' },
  };

  declare value: string;
  declare placeholder: string;
  declare type: string;
  declare disabled: boolean;
  declare invalid: boolean;
  declare name: string;

  static styles = css`
    :host {
      display: block;
      font-family: var(--mui-font-sans);
    }

    input {
      box-sizing: border-box;
      width: 100%;
      min-height: var(--mui-control-height-md);
      padding: 0 var(--mui-space-4);
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      font: inherit;
      font-size: var(--mui-text-md);
      transition: border-color var(--mui-duration-fast), box-shadow var(--mui-duration-fast), background var(--mui-duration-fast);
    }

    input::placeholder {
      color: var(--mui-color-text-muted);
    }

    input:hover {
      border-color: var(--mui-color-border-strong);
    }

    input:focus {
      outline: none;
      border-color: var(--mui-color-accent);
      box-shadow: var(--mui-focus-ring);
    }

    :host([invalid]) input {
      border-color: var(--mui-color-danger);
    }

    input:disabled {
      cursor: not-allowed;
      opacity: 0.6;
      background: var(--mui-color-surface-muted);
    }
  `;

  private onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.emit('input', { value: this.value, name: this.name });
    this.emit('change', { value: this.value, name: this.name });
  }

  template() {
    return html`
      <input
        part="control"
        name=${this.name}
        type=${this.type}
        .value=${this.value}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        @input=${(event: Event) => this.onInput(event)}
      />
    `;
  }
}

if (!customElements.get('mui-input')) {
  customElements.define('mui-input', MuiInput);
}
