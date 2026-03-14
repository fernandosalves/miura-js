import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-sidebar>...</mui-sidebar>
 * Sidebar for navigation or content.
 */
export class MuiSidebar extends MiuraElement {
  template() {
    return html`<aside class="mui-sidebar"><slot></slot></aside>`;
  }
  styles = css`
    .mui-sidebar {
      width: 220px;
      background: #fafafa;
      border-right: 1px solid #eee;
      min-height: 100vh;
      padding: var(--mui-spacing-3);
      box-sizing: border-box;
    }
  `;
}
customElements.define('mui-sidebar', MuiSidebar); 