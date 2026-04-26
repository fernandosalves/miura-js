import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiTextarea extends MiuraElement {
  static properties = {
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false, reflect: true },
    invalid: { type: Boolean, default: false, reflect: true },
    rows: { type: Number, default: 4 },
    name: { type: String, default: '' },
  };

  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare invalid: boolean;
  declare rows: number;
  declare name: string;

  static styles = css`
    :host {
      display: block;
      font-family: var(--mui-font-sans);
    }

    textarea {
      box-sizing: border-box;
      width: 100%;
      min-height: calc(var(--mui-control-height-md) * 2);
      padding: var(--mui-space-3) var(--mui-space-4);
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      font: inherit;
      font-size: var(--mui-text-md);
      line-height: 1.5;
      resize: vertical;
      transition: border-color var(--mui-duration-fast), box-shadow var(--mui-duration-fast), background var(--mui-duration-fast);
    }

    textarea::placeholder {
      color: var(--mui-color-text-muted);
    }

    textarea:hover {
      border-color: var(--mui-color-border-strong);
    }

    textarea:focus {
      outline: none;
      border-color: var(--mui-color-accent);
      box-shadow: var(--mui-focus-ring);
    }

    :host([invalid]) textarea {
      border-color: var(--mui-color-danger);
    }

    textarea:disabled {
      cursor: not-allowed;
      opacity: 0.6;
      background: var(--mui-color-surface-muted);
    }
  `;

  private onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    this.emit('input', { value: this.value, name: this.name }, { bubbles: true, composed: true });
    this.emit('change', { value: this.value, name: this.name }, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <textarea
        part="control"
        name=${this.name}
        rows=${this.rows}
        .value=${this.value}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        @input=${(event: Event) => this.onInput(event)}
      ></textarea>
    `;
  }
}

if (!customElements.get('mui-textarea')) {
  customElements.define('mui-textarea', MuiTextarea);
}
