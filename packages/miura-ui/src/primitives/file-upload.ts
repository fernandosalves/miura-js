import { MuiBase } from '../base/mui-base';
import { html, css } from '@miurajs/miura-element';

export class MuiFileUpload extends MuiBase {
  static properties = {};
  styles = css``;

  template() {
    return html`<input type="file" />`;
  }
}
customElements.define('mui-file-upload', MuiFileUpload);