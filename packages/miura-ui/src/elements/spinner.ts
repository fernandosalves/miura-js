import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiSpinner extends MiuraElement {
  static properties = {
    size: { type: String, default: 'md', reflect: true },
    label: { type: String, default: 'Loading' },
  };

  declare size: 'sm' | 'md' | 'lg';
  declare label: string;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.125rem;
      height: 1.125rem;
      color: var(--mui-color-accent);
    }

    :host([size="sm"]) {
      width: 0.875rem;
      height: 0.875rem;
    }

    :host([size="lg"]) {
      width: 1.5rem;
      height: 1.5rem;
    }

    .spinner {
      width: 100%;
      height: 100%;
      border: 2px solid color-mix(in srgb, currentColor 28%, transparent);
      border-top-color: currentColor;
      border-radius: var(--mui-radius-pill);
      animation: spin 720ms linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  template() {
    return html`<span class="spinner" part="spinner" role="status" aria-label=${this.label}></span>`;
  }
}

if (!customElements.get('mui-spinner')) {
  customElements.define('mui-spinner', MuiSpinner);
}
