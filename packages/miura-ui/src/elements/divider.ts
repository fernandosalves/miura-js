import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiDivider extends MiuraElement {
  static properties = {
    orientation: { type: String, default: 'horizontal', reflect: true },
    inset: { type: Boolean, default: false, reflect: true },
  };

  declare orientation: 'horizontal' | 'vertical';
  declare inset: boolean;

  static styles = css`
    :host {
      display: block;
      color: var(--mui-color-border);
    }

    :host([orientation="vertical"]) {
      display: inline-block;
      align-self: stretch;
      min-height: 1.5rem;
    }

    .line {
      border: 0;
      border-top: 1px solid currentColor;
      margin: 0;
    }

    :host([inset]) .line {
      margin-inline: var(--mui-space-5);
    }

    :host([orientation="vertical"]) .line {
      width: 0;
      height: 100%;
      min-height: inherit;
      border-top: 0;
      border-left: 1px solid currentColor;
    }

    :host([orientation="vertical"][inset]) .line {
      margin-inline: 0;
      margin-block: var(--mui-space-3);
    }
  `;

  template() {
    return html`<hr class="line" part="line" aria-orientation=${this.orientation} />`;
  }
}

if (!customElements.get('mui-divider')) {
  customElements.define('mui-divider', MuiDivider);
}
