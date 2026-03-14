import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-data-divider></mui-data-divider>
 * Minimal horizontal divider for data display sections.
 */
export class MuiDataDivider extends MiuraElement {
  template() {
    return html`<hr class="mui-data-divider" />`;
  }
  styles = css`
    .mui-data-divider {
      border: none;
      border-bottom: 1px solid #eee;
      margin: var(--mui-spacing-3) 0;
      width: 100%;
    }
  `;
}
customElements.define('mui-data-divider', MuiDataDivider); 