import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-label for="input-id">Label</mui-label>
 * Form label element.
 */
export class MuiLabel extends MiuraElement {
  static properties = {
    for: { type: String, reflect: true },
  };
  for: string = '';
  template() {
    return html`<label class="mui-label" for="${this.for}"><slot></slot></label>`;
  }
  styles = css`
    .mui-label {
      font-weight: 500;
      font-size: 1em;
      color: #222;
      margin-bottom: 0.25em;
      display: inline-block;
    }
  `;
}
customElements.define('mui-label', MuiLabel); 