import { MiuraElement, html, css } from '@miurajs/miura-element';

export class MuiIconButton extends MiuraElement {
  static properties = {};
  styles = css``;

  template() {
    return html`<button><slot></slot></button>`;
  }
}
customElements.define('mui-icon-button', MuiIconButton); 