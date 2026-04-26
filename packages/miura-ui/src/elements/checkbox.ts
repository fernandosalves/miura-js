import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiCheckbox extends MiuraElement {
  static properties = {
    checked: { type: Boolean, default: false, reflect: true },
    indeterminate: { type: Boolean, default: false, reflect: true },
    disabled: { type: Boolean, default: false, reflect: true },
    name: { type: String, default: '' },
  };

  declare checked: boolean;
  declare indeterminate: boolean;
  declare disabled: boolean;
  declare name: string;

  static styles = css`
    :host {
      display: inline-flex;
      font-family: var(--mui-font-sans);
      color: var(--mui-color-text);
    }

    label {
      display: inline-flex;
      align-items: center;
      gap: var(--mui-space-3);
      cursor: pointer;
      user-select: none;
      font-size: var(--mui-text-md);
    }

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .box {
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--mui-color-border-strong);
      border-radius: var(--mui-radius-sm);
      background: var(--mui-color-surface);
      color: #fff;
      transition: background var(--mui-duration-fast), border-color var(--mui-duration-fast), box-shadow var(--mui-duration-fast);
    }

    :host([checked]) .box,
    :host([indeterminate]) .box {
      background: var(--mui-color-accent);
      border-color: var(--mui-color-accent);
    }

    input:focus-visible + .box {
      box-shadow: var(--mui-focus-ring);
    }

    :host([disabled]) label {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .mark {
      font-size: 13px;
      line-height: 1;
      font-weight: var(--mui-weight-semibold);
    }
  `;

  private toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.indeterminate = false;
    this.emit('change', { checked: this.checked, indeterminate: this.indeterminate, name: this.name }, { bubbles: true, composed: true });
  }

  template() {
    const mark = this.indeterminate ? '-' : this.checked ? '✓' : '';

    return html`
      <label part="label">
        <input
          part="input"
          type="checkbox"
          name=${this.name}
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${() => this.toggle()}
        />
        <span class="box" part="control"><span class="mark">${mark}</span></span>
        <slot></slot>
      </label>
    `;
  }
}

if (!customElements.get('mui-checkbox')) {
  customElements.define('mui-checkbox', MuiCheckbox);
}
