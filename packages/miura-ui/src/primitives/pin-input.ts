import { MuiBase } from '../base/mui-base';
import { html, css } from '@miurajs/miura-element';

export class MuiPinInput extends MuiBase {
  static properties = {};
  styles = css``;

  template() {
    return html`<input type="text" inputmode="numeric" maxlength="1" />`;
  }
}
customElements.define('mui-pin-input', MuiPinInput);