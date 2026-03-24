import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-kbd>Ctrl+C</mui-kbd>
 * Keyboard input element.
 */
export class MuiKbd extends MiuraElement {
  template() {
    return html`<kbd class="mui-kbd"><slot></slot></kbd>`;
  }
  styles = css`
    .mui-kbd {
      font-family: var(--mui-font-mono, monospace);
      background: #f5f5f5;
      border-radius: 4px;
      padding: 0.1em 0.4em;
      font-size: 0.95em;
      border: 1px solid #ccc;
      color: #333;
      box-shadow: 0 1px 0 #fff inset;
    }
  `;
}
customElements.define('mui-kbd', MuiKbd); 