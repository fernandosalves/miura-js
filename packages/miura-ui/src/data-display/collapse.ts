import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-collapse open>Content</mui-collapse>
 * Minimal collapse/expand component.
 */
export class MuiCollapse extends MiuraElement {
  static properties = {
    open: { type: Boolean },
  };
  open = false;

  template() {
    return html`
      <div class="mui-collapse" style="display:${this.open ? 'block' : 'none'}">
        <slot></slot>
      </div>
    `;
  }
  styles = css`
    .mui-collapse {
      transition: max-height 0.2s, opacity 0.2s;
      overflow: hidden;
    }
  `;
}
customElements.define('mui-collapse', MuiCollapse); 