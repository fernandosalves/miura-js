import { MuiBase } from '../base/mui-base';
import { html, css } from '@miura/miura-element';

export class MuiAutocomplete extends MuiBase {
  static properties = {};
  styles = css``;

  template() {
    return html`<input type="text" autocomplete="on" />`;
  }
}
customElements.define('mui-autocomplete', MuiAutocomplete);