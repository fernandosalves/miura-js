import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-list>
 *   <li>Item 1</li>
 *   <li>Item 2</li>
 * </mui-list>
 * Wraps a list for consistent styling.
 */
export class MuiList extends MiuraElement {
  template() {
    return html`<ul class="mui-list"><slot></slot></ul>`;
  }
  styles = css`
    .mui-list {
      list-style: none;
      margin: 0;
      padding: 0;
      border-radius: var(--mui-radius);
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    ::slotted(li) {
      padding: 0.75em 1em;
      border-bottom: 1px solid #eee;
    }
    ::slotted(li:last-child) {
      border-bottom: none;
    }
  `;
}
customElements.define('mui-list', MuiList); 