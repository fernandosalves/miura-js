import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-spinner></mui-spinner>
 * Spinner for loading state.
 */
export class MuiSpinner extends MiuraElement {
  template() {
    return html`<span class="mui-spinner"></span>`;
  }
  styles = css`
    .mui-spinner {
      display: inline-block;
      width: 2em;
      height: 2em;
      border: 3px solid #eee;
      border-top: 3px solid var(--mui-primary, #0078d4);
      border-radius: 50%;
      animation: mui-spinner-spin 1s linear infinite;
    }
    @keyframes mui-spinner-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
}
customElements.define('mui-spinner', MuiSpinner); 