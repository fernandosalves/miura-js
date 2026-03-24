import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-tag removable>Label</mui-tag>
 * Tag with optional remove button.
 */
export class MuiTag extends MiuraElement {
  static properties = {
    removable: { type: Boolean },
  };
  removable = false;

  template() {
    return html`
      <span class="mui-tag">
        <slot></slot>
        ${this.removable ? html`<button class="mui-tag-remove" @click=${this._remove}>&times;</button>` : ''}
      </span>
    `;
  }

  _remove = () => {
    this.dispatchEvent(new CustomEvent('remove', { bubbles: true, composed: true }));
    this.remove();
  };

  styles = css`
    .mui-tag {
      display: inline-flex;
      align-items: center;
      background: #f0f0f0;
      color: #333;
      border-radius: 999px;
      padding: 0.25em 0.75em;
      font-size: 0.95em;
      font-weight: 500;
      gap: 0.5em;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .mui-tag-remove {
      background: none;
      border: none;
      color: #888;
      font-size: 1.1em;
      cursor: pointer;
      padding: 0 0.25em;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .mui-tag-remove:hover {
      background: #e0e0e0;
    }
  `;
}
customElements.define('mui-tag', MuiTag); 