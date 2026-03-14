import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-visually-hidden>Hidden content</mui-visually-hidden>
 * Visually hidden content for accessibility.
 */
export class MuiVisuallyHidden extends MiuraElement {
  template() {
    return html`<span class="mui-visually-hidden"><slot></slot></span>`;
  }
  styles = css`
    .mui-visually-hidden {
      position: absolute !important;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
}
customElements.define('mui-visually-hidden', MuiVisuallyHidden); 