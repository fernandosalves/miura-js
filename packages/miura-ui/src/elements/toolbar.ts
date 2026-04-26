import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiToolbar extends MiuraElement {
  static properties = {
    label: { type: String, default: 'Toolbar' },
  };

  declare label: string;

  static styles = css`
    :host {
      min-height: var(--mui-toolbar-height);
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      padding: 0 var(--mui-space-3);
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      box-shadow: var(--mui-shadow-sm);
      font-family: var(--mui-font-sans);
    }

    ::slotted(*) {
      flex-shrink: 0;
    }
  `;

  template() {
    return html`<div part="toolbar" role="toolbar" aria-label=${this.label}><slot></slot></div>`;
  }
}

if (!customElements.get('mui-toolbar')) {
  customElements.define('mui-toolbar', MuiToolbar);
}
