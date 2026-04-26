import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiSkeleton extends MiuraElement {
  static properties = {
    variant: { type: String, default: 'text', reflect: true },
    animated: { type: Boolean, default: true, reflect: true },
  };

  declare variant: 'text' | 'block' | 'circle';
  declare animated: boolean;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-height: 1rem;
      border-radius: var(--mui-radius-sm);
      background: linear-gradient(
        90deg,
        var(--mui-color-surface-muted) 0%,
        var(--mui-color-surface-hover) 42%,
        var(--mui-color-surface-muted) 78%
      );
      background-size: 220% 100%;
    }

    :host([animated]) {
      animation: shimmer 1.2s var(--mui-ease-standard) infinite;
    }

    :host([variant="text"]) {
      height: 0.875rem;
      min-height: 0;
      border-radius: var(--mui-radius-pill);
    }

    :host([variant="block"]) {
      min-height: 5rem;
      border-radius: var(--mui-radius-md);
    }

    :host([variant="circle"]) {
      width: 2.25rem;
      height: 2.25rem;
      min-height: 0;
      border-radius: var(--mui-radius-pill);
    }

    @media (prefers-reduced-motion: reduce) {
      :host([animated]) {
        animation: none;
      }
    }

    @keyframes shimmer {
      from { background-position: 120% 0; }
      to { background-position: -120% 0; }
    }
  `;

  template() {
    return html`<span part="placeholder" aria-hidden="true"></span>`;
  }
}

if (!customElements.get('mui-skeleton')) {
  customElements.define('mui-skeleton', MuiSkeleton);
}
