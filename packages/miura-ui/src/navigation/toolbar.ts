import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-toolbar>...</mui-toolbar>
 * Toolbar for actions and navigation.
 */
export class MuiToolbar extends MiuraElement {
  template() {
    return html`<div class="mui-toolbar"><slot></slot></div>`;
  }
  styles = css`
    .mui-toolbar {
      display: flex;
      gap: var(--mui-spacing-2);
      align-items: center;
      background: #f5f5f5;
      padding: var(--mui-spacing-2) var(--mui-spacing-3);
      border-radius: var(--mui-radius);
    }
  `;
}
customElements.define('mui-toolbar', MuiToolbar); 