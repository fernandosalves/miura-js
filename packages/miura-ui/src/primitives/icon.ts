import { MuiBase } from '../base/mui-base';
import { html, css } from '@miurajs/miura-element';

export class MuiIcon extends MuiBase {
  static properties = {};
  styles = css``;

  template() {
    return html`<span><slot></slot></span>`;
  }
}
customElements.define('mui-icon', MuiIcon);