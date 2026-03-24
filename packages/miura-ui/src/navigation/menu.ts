import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-menu open>
 *   <mui-menu-item>Item 1</mui-menu-item>
 *   <mui-menu-item>Item 2</mui-menu-item>
 * </mui-menu>
 */
export class MuiMenu extends MiuraElement {
  static properties = {
    open: { type: Boolean },
  };
  open = false;

  template() {
    if (!this.open) return html``;
    return html`
      <div class="mui-menu-content">
        <slot></slot>
      </div>
    `;
  }

  styles = css`
    .mui-menu-content {
      position: absolute;
      background: white;
      border-radius: var(--mui-radius);
      box-shadow: 0 2px 16px rgba(0,0,0,0.2);
      min-width: 160px;
      padding: var(--mui-spacing-2) 0;
      z-index: 1000;
    }
  `;
}
customElements.define('mui-menu', MuiMenu);

export class MuiMenuItem extends MiuraElement {
  template() {
    return html`<button class="mui-menu-item"><slot></slot></button>`;
  }
  styles = css`
    .mui-menu-item {
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      padding: var(--mui-spacing-2) var(--mui-spacing-3);
      cursor: pointer;
      font: inherit;
      transition: background 0.2s;
    }
    .mui-menu-item:hover, .mui-menu-item:focus {
      background: #f0f0f0;
    }
  `;
}
customElements.define('mui-menu-item', MuiMenuItem); 