import { MiuraElement, html, css } from '@miura/miura-element';

/**
 * <mui-persona>
 *   <mui-avatar src="avatar.jpg"></mui-avatar>
 *   <span>Jane Doe</span>
 * </mui-persona>
 * Minimal persona component for user display.
 */
export class MuiPersona extends MiuraElement {
  template() {
    return html`<div class="mui-persona"><slot></slot></div>`;
  }
  styles = css`
    .mui-persona {
      display: flex;
      align-items: center;
      gap: var(--mui-spacing-2);
      background: #fff;
      border-radius: var(--mui-radius);
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      padding: var(--mui-spacing-2) var(--mui-spacing-3);
    }
  `;
}
customElements.define('mui-persona', MuiPersona); 