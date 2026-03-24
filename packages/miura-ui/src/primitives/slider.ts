import { MuiBase } from '../base/mui-base';
import { html, css } from '@miurajs/miura-element';

export class MuiSlider extends MuiBase {
  static properties = {};
  styles = css``;

  template() {
    return html`<input type="range" />`;
  }
}
customElements.define('mui-slider', MuiSlider); 