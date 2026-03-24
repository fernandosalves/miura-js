import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-overlay-progress open>Loading...</mui-overlay-progress>
 * Overlay progress indicator.
 */
export class MuiOverlayProgress extends MiuraElement {
  static properties = {
    open: { type: Boolean },
  };
  open = false;

  template() {
    if (!this.open) return html``;
    return html`<div class="mui-overlay-progress"><slot></slot></div>`;
  }
  styles = css`
    .mui-overlay-progress {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1300;
    }
  `;
}
customElements.define('mui-overlay-progress', MuiOverlayProgress); 