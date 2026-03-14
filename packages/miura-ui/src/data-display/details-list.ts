import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-details-list>
 *   <div>Detail 1</div>
 *   <div>Detail 2</div>
 * </mui-details-list>
 * Minimal details list component.
 */
export class MuiDetailsList extends MiuraElement {
  template() {
    return html`<div class="mui-details-list"><slot></slot></div>`;
  }
  styles = css`
    .mui-details-list {
      display: flex;
      flex-direction: column;
      gap: var(--mui-spacing-2);
      background: #fff;
      border-radius: var(--mui-radius);
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      padding: var(--mui-spacing-3);
    }
  `;
}
customElements.define('mui-details-list', MuiDetailsList); 