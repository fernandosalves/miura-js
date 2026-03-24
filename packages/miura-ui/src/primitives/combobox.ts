import { MuiBase } from '../base/mui-base';
import { html, css } from '@miurajs/miura-element';

export class MuiCombobox extends MuiBase {
  static properties = {};
  styles = css``;

  template() {
    return html`<input type="text" role="combobox" />`;
  }
}
customElements.define('mui-combobox', MuiCombobox);