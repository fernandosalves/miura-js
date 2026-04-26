import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiPanel extends MiuraElement {
  static properties = {
    title: { type: String, default: '' },
    subtle: { type: Boolean, default: false, reflect: true },
  };

  declare title: string;
  declare subtle: boolean;

  static styles = css`
    :host {
      display: block;
      min-width: 0;
      min-height: 0;
      border-right: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
    }

    :host([subtle]) {
      background: var(--mui-color-surface-muted);
    }

    .header {
      min-height: var(--mui-toolbar-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-4);
      padding: 0 var(--mui-space-5);
      border-bottom: 1px solid var(--mui-color-border);
    }

    .title {
      font-size: var(--mui-text-md);
      font-weight: var(--mui-weight-semibold);
    }

    .body {
      padding: var(--mui-space-5);
      overflow: auto;
    }
  `;

  template() {
    return html`
      ${this.title || this.hasSlot('actions') ? html`
        <div class="header" part="header">
          <div class="title" part="title">${this.title}</div>
          <slot name="actions"></slot>
        </div>
      ` : ''}
      <div class="body" part="body"><slot></slot></div>
    `;
  }
}

if (!customElements.get('mui-panel')) {
  customElements.define('mui-panel', MuiPanel);
}
