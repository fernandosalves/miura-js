import { MuiBase } from '../base/mui-base';
import { html, css } from '@miurajs/miura-element';

export class MuiTextarea extends MuiBase {
  static properties = {};
  styles = css``;

  template() {
    return html`<textarea></textarea>`;
  }
}
customElements.define('mui-textarea', MuiTextarea); 