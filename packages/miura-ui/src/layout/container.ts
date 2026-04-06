// miura-ui: layout/container.ts
// Responsive container primitive for MiuraJS
import { MiuraElement, html, css } from '@miurajs/miura-element';

const SIZE_MAP: Record<string, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%'
};

export class MuiContainer extends MiuraElement {
  static tagName = 'mui-container';

  static properties = {
    size: { type: String, reflect: true, default: 'lg' },
    padding: { type: String, default: 'var(--mui-spacing-md)' },
    center: { type: Boolean, reflect: true, default: true },
  };

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }
      :host([center]) .container {
        margin-left: auto;
        margin-right: auto;
      }
      .container {
        width: 100%;
        box-sizing: border-box;
      }
    `;
  }

  getMaxWidth() {
    return SIZE_MAP[this.size] || SIZE_MAP.lg;
  }

  template() {
    const styleString = `max-width: ${this.getMaxWidth()}; padding-left: ${this.padding}; padding-right: ${this.padding}`;

    return html`
      <div class="container" part="container" style="${styleString}">
        <slot></slot>
      </div>
    `;
  }
}

if (!customElements.get(MuiContainer.tagName)) {
  customElements.define(MuiContainer.tagName, MuiContainer);
}
