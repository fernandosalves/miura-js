import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiKbd extends MiuraElement {
  static properties = {
    size: { type: String, default: 'md', reflect: true },
  };

  declare size: 'sm' | 'md';

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.55em;
      min-height: 1.55em;
      padding: 0 var(--mui-space-2);
      border: 1px solid var(--mui-color-border-strong);
      border-radius: var(--mui-radius-sm);
      background: var(--mui-color-surface-raised);
      color: var(--mui-color-text);
      box-shadow: inset 0 -1px 0 var(--mui-color-border), var(--mui-shadow-sm);
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
      font-weight: var(--mui-weight-medium);
      line-height: 1;
      vertical-align: baseline;
    }

    :host([size="sm"]) {
      min-width: 1.35em;
      min-height: 1.35em;
      padding-inline: 0.32rem;
      font-size: 0.6875rem;
    }
  `;

  template() {
    return html`<kbd part="key"><slot></slot></kbd>`;
  }
}

if (!customElements.get('mui-kbd')) {
  customElements.define('mui-kbd', MuiKbd);
}
