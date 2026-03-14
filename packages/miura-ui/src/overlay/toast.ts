import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-toast open duration="3000">Toast message</mui-toast>
 * Auto-dismisses after duration ms.
 */
export class MuiToast extends MiuraElement {
  static properties = {
    open: { type: Boolean },
    duration: { type: Number },
  };
  open = false;
  duration = 3000;
  _timeout: any = null;

  updated(changed: Map<string, any>) {
    if (changed.has('open') && this.open) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(() => {
        this.open = false;
        this.requestUpdate();
      }, this.duration);
    }
  }

  template() {
    if (!this.open) return html``;
    return html`
      <div class="mui-toast-content">
        <slot></slot>
      </div>
    `;
  }

  styles = css`
    .mui-toast-content {
      position: fixed;
      left: 50%;
      bottom: 2rem;
      transform: translateX(-50%);
      background: #222;
      color: #fff;
      border-radius: var(--mui-radius);
      padding: var(--mui-spacing-2) var(--mui-spacing-3);
      font-size: 1em;
      z-index: 1200;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      pointer-events: auto;
    }
  `;
}
customElements.define('mui-toast', MuiToast); 