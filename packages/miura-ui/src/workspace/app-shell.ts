import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiAppShell extends MiuraElement {
  static properties = {
    inspector: { type: Boolean, default: true, reflect: true },
  };

  declare inspector: boolean;

  static styles = css`
    :host {
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr) auto;
      width: 100%;
      height: 100%;
      min-height: 0;
      background: var(--mui-color-bg);
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
      overflow: hidden;
    }

    .slot {
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }

    .nav {
      width: var(--mui-nav-panel-width);
      border-right: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface);
    }

    .content {
      overflow: auto;
    }

    .inspector {
      width: var(--mui-inspector-width);
      border-left: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface);
    }

    :host(:not([inspector])) .inspector {
      display: none;
    }
  `;

  template() {
    return html`
      <div class="slot rail" part="rail"><slot name="rail"></slot></div>
      <div class="slot nav" part="nav"><slot name="nav"></slot></div>
      <main class="slot content" part="content"><slot></slot></main>
      <aside class="slot inspector" part="inspector"><slot name="inspector"></slot></aside>
    `;
  }
}

if (!customElements.get('mui-app-shell')) {
  customElements.define('mui-app-shell', MuiAppShell);
}
