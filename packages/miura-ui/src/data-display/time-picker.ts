import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-time-picker></mui-time-picker>
 * Minimal time picker component (placeholder for future features).
 */
export class MuiTimePicker extends MiuraElement {
  template() {
    return html`<div class="mui-time-picker"><slot></slot></div>`;
  }
  styles = css`
    .mui-time-picker {
      background: #fff;
      border-radius: var(--mui-radius);
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      padding: var(--mui-spacing-3);
      min-width: 180px;
      min-height: 60px;
    }
  `;
}
customElements.define('mui-time-picker', MuiTimePicker); 