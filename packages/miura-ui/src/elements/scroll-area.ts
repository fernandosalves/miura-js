import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiScrollArea extends MiuraElement {
  static properties = {
    maxHeight: { type: String, default: '320px', attribute: 'max-height' },
    shadow: { type: Boolean, default: true, reflect: true },
  };

  declare maxHeight: string;
  declare shadow: boolean;

  static styles = css`
    :host {
      display: block;
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
      --_max-height: 320px;
    }

    .viewport {
      max-height: var(--_max-height);
      overflow: auto;
      scrollbar-gutter: stable;
      overscroll-behavior: contain;
      border-radius: inherit;
    }

    .viewport::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    .viewport::-webkit-scrollbar-track {
      background: transparent;
    }

    .viewport::-webkit-scrollbar-thumb {
      border: 3px solid transparent;
      border-radius: var(--mui-radius-pill);
      background: color-mix(in srgb, var(--mui-color-text-muted) 48%, transparent);
      background-clip: content-box;
    }

    .wrap {
      position: relative;
      border-radius: inherit;
    }

    :host([shadow]) .wrap::before,
    :host([shadow]) .wrap::after {
      content: "";
      position: absolute;
      inset-inline: 0;
      height: 18px;
      pointer-events: none;
      z-index: 1;
    }

    :host([shadow]) .wrap::before {
      top: 0;
      background: linear-gradient(var(--mui-color-surface), transparent);
    }

    :host([shadow]) .wrap::after {
      bottom: 0;
      background: linear-gradient(transparent, var(--mui-color-surface));
    }
  `;

  template() {
    this.style.setProperty('--_max-height', this.maxHeight || '320px');
    return html`
      <div class="wrap" part="wrap">
        <div class="viewport" part="viewport">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-scroll-area')) {
  customElements.define('mui-scroll-area', MuiScrollArea);
}
