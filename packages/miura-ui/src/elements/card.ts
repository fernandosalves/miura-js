import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiCard extends MiuraElement {
  static properties = {
    interactive: { type: Boolean, default: false, reflect: true },
    selected: { type: Boolean, default: false, reflect: true },
  };

  declare interactive: boolean;
  declare selected: boolean;

  static styles = css`
    :host {
      display: block;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      box-shadow: var(--mui-shadow-sm);
      font-family: var(--mui-font-sans);
      overflow: hidden;
      transition: border-color var(--mui-duration-fast), box-shadow var(--mui-duration-fast), transform var(--mui-duration-fast);
    }

    :host([interactive]) {
      cursor: pointer;
    }

    :host([interactive]:hover) {
      border-color: var(--mui-color-border-strong);
      box-shadow: var(--mui-shadow-md);
      transform: translateY(-1px);
    }

    :host([selected]) {
      border-color: var(--mui-color-accent);
      box-shadow: var(--mui-focus-ring);
    }

    .body {
      display: grid;
      gap: var(--mui-space-4);
      padding: var(--mui-space-5);
    }
  `;

  template() {
    return html`<div class="body" part="body"><slot></slot></div>`;
  }
}

if (!customElements.get('mui-card')) {
  customElements.define('mui-card', MuiCard);
}
