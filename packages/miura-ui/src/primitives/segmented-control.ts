import { MuiBase } from '../base/mui-base';
import { html, css } from '@miura/miura-element';

export class MuiSegmentedControl extends MuiBase {
  static properties = {};
  styles = css``;

  template() {
    return html`<div><slot></slot></div>`;
  }
}
customElements.define('mui-segmented-control', MuiSegmentedControl);