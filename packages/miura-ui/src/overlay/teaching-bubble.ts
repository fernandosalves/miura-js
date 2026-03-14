import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-teaching-bubble open>Tip content</mui-teaching-bubble>
 * Teaching bubble for onboarding or tips.
 */
export class MuiTeachingBubble extends MiuraElement {
  static properties = {
    open: { type: Boolean },
  };
  open = false;

  template() {
    if (!this.open) return html``;
    return html`<div class="mui-teaching-bubble"><slot></slot></div>`;
  }
  styles = css`
    .mui-teaching-bubble {
      position: absolute;
      background: #fffbe6;
      color: #856404;
      border-radius: var(--mui-radius);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: var(--mui-spacing-3);
      z-index: 1200;
      min-width: 200px;
      max-width: 320px;
    }
  `;
}
customElements.define('mui-teaching-bubble', MuiTeachingBubble); 