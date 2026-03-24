import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-blockquote>Quote</mui-blockquote>
 * Blockquote element.
 */
export class MuiBlockquote extends MiuraElement {
  template() {
    return html`<blockquote class="mui-blockquote"><slot></slot></blockquote>`;
  }
  styles = css`
    .mui-blockquote {
      border-left: 4px solid #eee;
      margin: 1em 0;
      padding: 0.5em 1em;
      color: #555;
      background: #fafafa;
      font-style: italic;
    }
  `;
}
customElements.define('mui-blockquote', MuiBlockquote); 