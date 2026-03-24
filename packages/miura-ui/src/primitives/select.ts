import { MuiBase } from '../base/mui-base';
import { html, css } from '@miurajs/miura-element';

export class MuiSelect extends MuiBase {
  static properties = {};
  styles = css``;

  template() {
    return html`<select><slot></slot></select>`;
  }
}
customElements.define('mui-select', MuiSelect); 