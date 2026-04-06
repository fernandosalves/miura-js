// miura-ui: layout/box.ts
// Simple box primitive for spacing, backgrounds, and layout
import { MiuraElement, html, css } from '@miurajs/miura-element';

export class MuiBox extends MiuraElement {
  static tagName = 'mui-box';

  static properties = {
    padding: { type: String, default: '' },
    margin: { type: String, default: '' },
    background: { type: String, default: '' },
    border: { type: String, default: '' },
    radius: { type: String, default: '' },
    shadow: { type: String, default: '' },
  };

  static get styles() {
    return css`
      :host {
        display: block;
        box-sizing: border-box;
      }
    `;
  }

  template() {
    const styleMap = {
      ...(this.padding && { 'padding': this.padding }),
      ...(this.margin && { 'margin': this.margin }),
      ...(this.background && { 'background': this.background }),
      ...(this.border && { 'border': this.border }),
      ...(this.radius && { 'border-radius': this.radius }),
      ...(this.shadow && { 'box-shadow': this.shadow })
    };
    
    const styleString = Object.entries(styleMap)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    return html`<slot ${styleString ? `style="${styleString}"` : ''}></slot>`;
  }
}

if (!customElements.get(MuiBox.tagName)) {
  customElements.define(MuiBox.tagName, MuiBox);
}
