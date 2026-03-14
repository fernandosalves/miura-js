import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-popover open anchor="#btn">...</mui-popover>
 * Positions itself relative to the anchor element.
 */
export class MuiPopover extends MiuraElement {
  static properties = {
    open: { type: Boolean },
    anchor: { type: String },
  };
  open = false;
  anchor: string = '';

  template() {
    if (!this.open) return html``;
    return html`
      <div class="mui-popover-content" style=${this._getStyle()}>
        <slot></slot>
      </div>
    `;
  }

  _getStyle() {
    // Minimal: position absolute, top/left of anchor if found
    const anchorEl = this.anchor ? document.querySelector(this.anchor) : null;
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      return `position: absolute; top: ${rect.bottom + window.scrollY}px; left: ${rect.left + window.scrollX}px;`;
    }
    return '';
  }

  styles = css`
    .mui-popover-content {
      background: white;
      border-radius: var(--mui-radius);
      box-shadow: 0 2px 16px rgba(0,0,0,0.2);
      min-width: 160px;
      min-height: 40px;
      padding: var(--mui-spacing-2);
      z-index: 1000;
    }
  `;
}
customElements.define('mui-popover', MuiPopover); 