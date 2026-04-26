import { MiuraElement, css, html } from '@miurajs/miura-element';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export class MuiSelect extends MiuraElement {
  static properties = {
    options: { type: Array, default: () => [] },
    value: { type: String, default: '' },
    placeholder: { type: String, default: 'Select...' },
    disabled: { type: Boolean, default: false, reflect: true },
    invalid: { type: Boolean, default: false, reflect: true },
    name: { type: String, default: '' },
  };

  declare options: SelectOption[];
  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare invalid: boolean;
  declare name: string;

  static styles = css`
    :host {
      display: block;
      font-family: var(--mui-font-sans);
    }

    select {
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
      cursor: pointer;
      transition: border-color var(--mui-duration-fast), box-shadow var(--mui-duration-fast);
    }

    select:focus {
      outline: none;
      border-color: var(--mui-color-accent);
      box-shadow: var(--mui-focus-ring);
    }

    :host([invalid]) select {
      border-color: var(--mui-color-danger);
    }

    select:disabled {
      cursor: not-allowed;
      opacity: 0.6;
      background: var(--mui-color-surface-muted);
    }
  `;

  private onChange(event: Event): void {
    this.value = (event.target as HTMLSelectElement).value;
    const option = (this.options ?? []).find((item) => item.value === this.value);
    this.emit('change', { value: this.value, option, name: this.name }, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <select
        part="control"
        name=${this.name}
        .value=${this.value}
        ?disabled=${this.disabled}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        @change=${(event: Event) => this.onChange(event)}
      >
        <option value="" ?disabled=${Boolean(this.value)}>${this.placeholder}</option>
        ${(this.options ?? []).map((option) => html`
          <option value=${option.value} ?disabled=${Boolean(option.disabled)} ?selected=${option.value === this.value}>${option.label}</option>
        `)}
      </select>
    `;
  }
}

if (!customElements.get('mui-select')) {
  customElements.define('mui-select', MuiSelect);
}
