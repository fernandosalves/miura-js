import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-dialod open>...</mui-dialod>
 * Emits 'close' event when closed.
 */
export class MuiDialod extends MiuraElement {
  static properties = {
    open: { type: Boolean },
  };
  open = false;

  template() {
    if (!this.open) return html``;
    return html`
      <div class="mui-dialod-backdrop" @click=${this._onBackdropClick}></div>
      <div class="mui-dialod-content">
        <slot></slot>
      </div>
    `;
  }

  _onBackdropClick = () => {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  };

  styles = css`
    .mui-dialod-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 999;
    }
    .mui-dialod-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: var(--mui-radius);
      box-shadow: 0 2px 16px rgba(0,0,0,0.2);
      z-index: 1000;
      min-width: 320px;
      min-height: 120px;
      padding: var(--mui-spacing-3);
    }
  `;
}
customElements.define('mui-dialod', MuiDialod); 