import { MiuraElement, html } from '@miurajs/miura-element';
import { portal } from '../utils/portal';

/**
 * <mui-portal target="body">...</mui-portal>
 * Renders its slot content into the specified target (default: document.body).
 */
export class MuiPortal extends MiuraElement {
  static properties = {
    target: { type: String },
  };

  target: string = 'body';
  _portalNode: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback?.();
    this._moveContent();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    if (this._portalNode && this._portalNode.parentNode) {
      this._portalNode.parentNode.removeChild(this._portalNode);
    }
  }

  _moveContent() {
    const targetEl = this._resolveTarget();
    if (!targetEl) return;
    if (!this._portalNode) {
      this._portalNode = document.createElement('div');
      while (this.firstChild) {
        this._portalNode.appendChild(this.firstChild);
      }
    }
    portal(this._portalNode, targetEl);
  }

  _resolveTarget(): HTMLElement | null {
    if (this.target === 'body') return document.body;
    if (this.target) return document.querySelector(this.target);
    return null;
  }

  template() {
    // Nothing is rendered in the light DOM
    return html``;
  }
}

customElements.define('mui-portal', MuiPortal); 