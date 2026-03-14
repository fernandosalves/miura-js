import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-calendar></mui-calendar>
 * Minimal calendar component (placeholder for future features).
 */
export class MuiCalendar extends MiuraElement {
  template() {
    return html`<div class="mui-calendar"><slot></slot></div>`;
  }
  styles = css`
    .mui-calendar {
      background: #fff;
      border-radius: var(--mui-radius);
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      padding: var(--mui-spacing-3);
      min-width: 240px;
      min-height: 180px;
    }
  `;
}
customElements.define('mui-calendar', MuiCalendar); 