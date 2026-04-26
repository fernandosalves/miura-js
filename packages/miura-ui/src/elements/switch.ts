import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiSwitch extends MiuraElement {
  static properties = {
    checked: { type: Boolean, default: false, reflect: true },
    disabled: { type: Boolean, default: false, reflect: true },
    label: { type: String, default: '' },
  };

  declare checked: boolean;
  declare disabled: boolean;
  declare label: string;

  static styles = css`
    :host {
      display: inline-flex;
      font-family: var(--mui-font-sans);
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: var(--mui-space-3);
      border: 0;
      background: transparent;
      color: var(--mui-color-text);
      font: inherit;
      cursor: pointer;
      padding: 0;
    }

    button:focus-visible .track {
      box-shadow: var(--mui-focus-ring);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.58;
    }

    .track {
      width: 34px;
      height: 20px;
      border-radius: var(--mui-radius-pill);
      background: var(--mui-color-border-strong);
      position: relative;
      transition: background var(--mui-duration-fast);
    }

    .thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 14px;
      height: 14px;
      border-radius: var(--mui-radius-pill);
      background: #fff;
      box-shadow: var(--mui-shadow-sm);
      transition: transform var(--mui-duration-fast) var(--mui-ease-standard);
    }

    :host([checked]) .track {
      background: var(--mui-color-accent);
    }

    :host([checked]) .thumb {
      transform: translateX(14px);
    }

    .label {
      font-size: var(--mui-text-md);
    }
  `;

  private toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.emit('change', { checked: this.checked });
  }

  template() {
    return html`
      <button
        part="control"
        role="switch"
        aria-checked=${this.checked ? 'true' : 'false'}
        ?disabled=${this.disabled}
        @click=${() => this.toggle()}
      >
        <span class="track" part="track"><span class="thumb" part="thumb"></span></span>
        <slot><span class="label">${this.label}</span></slot>
      </button>
    `;
  }
}

if (!customElements.get('mui-switch')) {
  customElements.define('mui-switch', MuiSwitch);
}
