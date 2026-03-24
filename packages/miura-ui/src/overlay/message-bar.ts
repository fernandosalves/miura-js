import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-message-bar type="info">Info message</mui-message-bar>
 * Message bar for inline notifications.
 */
export class MuiMessageBar extends MiuraElement {
  static properties = {
    type: { type: String },
  };
  type: 'info' | 'success' | 'error' | 'warning' = 'info';

  template() {
    return html`<div class="mui-message-bar mui-message-bar-${this.type}"><slot></slot></div>`;
  }
  styles = css`
    .mui-message-bar {
      padding: var(--mui-spacing-2) var(--mui-spacing-3);
      border-radius: var(--mui-radius);
      margin: var(--mui-spacing-2) 0;
      font-weight: 500;
      background: #f5f5f5;
      color: #333;
    }
    .mui-message-bar-info { background: #e7f3fe; color: #0c5460; }
    .mui-message-bar-success { background: #e6f9ec; color: #218838; }
    .mui-message-bar-error { background: #fdecea; color: #c82333; }
    .mui-message-bar-warning { background: #fff3cd; color: #856404; }
  `;
}
customElements.define('mui-message-bar', MuiMessageBar); 