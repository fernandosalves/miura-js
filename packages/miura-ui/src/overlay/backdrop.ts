import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-backdrop open></mui-backdrop>
 * Backdrop overlay for modals, drawers, etc.
 */
export class MuiBackdrop extends MiuraElement {
  static properties = {
    open: { type: Boolean },
  };
  open = false;

  template() {
    if (!this.open) return html``;
    return html`<div class="mui-backdrop"><slot></slot></div>`;
  }
  styles = css`
    .mui-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 1100;
    }
  `;
}
customElements.define('mui-backdrop', MuiBackdrop); 