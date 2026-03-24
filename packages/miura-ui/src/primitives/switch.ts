import { MuiBase } from '../base/mui-base';
import { html, css } from '@miurajs/miura-element';

export class MuiSwitch extends MuiBase {
  static properties = {};
  styles = css``;

  template() {
    return html`<input type="checkbox" role="switch" />`;
  }
}
customElements.define('mui-switch', MuiSwitch); 