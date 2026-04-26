import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiTooltip extends MiuraElement {
  static properties = {
    text: { type: String, default: '' },
    open: { type: Boolean, default: false, reflect: true },
  };

  declare text: string;
  declare open: boolean;

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
      font-family: var(--mui-font-sans);
    }

    .bubble {
      position: absolute;
      z-index: 50;
      bottom: calc(100% + var(--mui-space-2));
      left: 50%;
      transform: translateX(-50%);
      display: none;
      width: max-content;
      max-width: 260px;
      padding: var(--mui-space-2) var(--mui-space-3);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-text);
      color: var(--mui-color-surface);
      box-shadow: var(--mui-shadow-md);
      font-size: var(--mui-text-xs);
      line-height: 1.35;
      pointer-events: none;
    }

    :host([open]) .bubble {
      display: block;
    }
  `;

  private show(): void {
    this.open = true;
  }

  private hide(): void {
    this.open = false;
  }

  template() {
    return html`
      <span part="anchor" @mouseenter=${() => this.show()} @mouseleave=${() => this.hide()} @focusin=${() => this.show()} @focusout=${() => this.hide()}>
        <slot></slot>
      </span>
      <span class="bubble" part="bubble" role="tooltip">${this.text}</span>
    `;
  }
}

if (!customElements.get('mui-tooltip')) {
  customElements.define('mui-tooltip', MuiTooltip);
}
