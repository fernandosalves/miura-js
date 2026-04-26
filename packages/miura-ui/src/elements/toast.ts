import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiToast extends MiuraElement {
  static properties = {
    open: { type: Boolean, default: false, reflect: true },
    tone: { type: String, default: 'neutral', reflect: true },
  };

  declare open: boolean;
  declare tone: 'neutral' | 'success' | 'warning' | 'danger';

  static styles = css`
    :host {
      display: block;
      pointer-events: none;
      font-family: var(--mui-font-sans);
    }

    .toast {
      display: none;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-4);
      min-width: min(360px, 100%);
      padding: var(--mui-space-4) var(--mui-space-5);
      border: 1px solid var(--mui-color-border);
      border-left: 4px solid var(--_tone, var(--mui-color-border-strong));
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      box-shadow: var(--mui-shadow-lg);
      pointer-events: auto;
    }

    :host([open]) .toast {
      display: flex;
    }

    :host([tone="success"]) { --_tone: var(--mui-color-success); }
    :host([tone="warning"]) { --_tone: var(--mui-color-warning); }
    :host([tone="danger"]) { --_tone: var(--mui-color-danger); }

    button {
      border: 0;
      background: transparent;
      color: var(--mui-color-text-muted);
      cursor: pointer;
      font: inherit;
    }

    button:hover {
      color: var(--mui-color-text);
    }
  `;

  close(): void {
    this.open = false;
    this.emit('open-change', { open: false }, { bubbles: true, composed: true });
  }

  show(): void {
    this.open = true;
    this.emit('open-change', { open: true }, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <div class="toast" part="toast" role="status" aria-live="polite">
        <slot></slot>
        <button part="close" aria-label="Dismiss notification" @click=${() => this.close()}>Dismiss</button>
      </div>
    `;
  }
}

if (!customElements.get('mui-toast')) {
  customElements.define('mui-toast', MuiToast);
}
