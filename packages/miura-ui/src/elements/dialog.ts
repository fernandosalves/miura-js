import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiDialog extends MiuraElement {
  static properties = {
    open: { type: Boolean, default: false, reflect: true },
    heading: { type: String, default: '' },
    description: { type: String, default: '' },
    modal: { type: Boolean, default: true },
  };

  declare open: boolean;
  declare heading: string;
  declare description: string;
  declare modal: boolean;

  static styles = css`
    :host {
      display: contents;
      font-family: var(--mui-font-sans);
    }

    .backdrop {
      position: fixed;
      inset: 0;
      display: none;
      place-items: center;
      padding: var(--mui-space-7);
      background: color-mix(in srgb, #000 42%, transparent);
      z-index: 1000;
    }

    :host([open]) .backdrop {
      display: grid;
    }

    .panel {
      width: min(520px, 100%);
      max-height: min(720px, 90vh);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      box-shadow: var(--mui-shadow-lg);
      overflow: hidden;
    }

    header,
    footer {
      padding: var(--mui-space-5);
    }

    header {
      display: grid;
      gap: var(--mui-space-2);
      border-bottom: 1px solid var(--mui-color-border);
    }

    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-4);
    }

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: var(--mui-text-xl);
      line-height: 1.2;
    }

    p {
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-md);
    }

    .close {
      width: var(--mui-control-height-sm);
      height: var(--mui-control-height-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: var(--mui-radius-md);
      background: transparent;
      color: var(--mui-color-text-muted);
      cursor: pointer;
    }

    .close:hover {
      background: var(--mui-color-surface-hover);
      color: var(--mui-color-text);
    }

    .close:focus-visible {
      outline: none;
      box-shadow: var(--mui-focus-ring);
    }

    .body {
      min-height: 0;
      overflow: auto;
      padding: var(--mui-space-5);
    }

    footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--mui-space-3);
      border-top: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface-muted);
    }

    @media (prefers-reduced-motion: no-preference) {
      .panel {
        animation: enter var(--mui-duration-base) var(--mui-ease-standard);
      }

      @keyframes enter {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this.onDocumentKeyDown);
  }

  disconnectedCallback(): void {
    document.removeEventListener('keydown', this.onDocumentKeyDown);
    super.disconnectedCallback();
  }

  close(reason: 'escape' | 'backdrop' | 'close' | 'action' = 'close'): void {
    if (!this.open) return;
    this.open = false;
    this.emit('open-change', { open: false, reason }, { bubbles: true, composed: true });
    this.emit('close', { reason }, { bubbles: true, composed: true });
  }

  show(): void {
    if (this.open) return;
    this.open = true;
    this.emit('open-change', { open: true }, { bubbles: true, composed: true });
  }

  private onDocumentKeyDown = (event: KeyboardEvent): void => {
    if (!this.open || event.key !== 'Escape') return;
    this.close('escape');
  };

  private onBackdropClick(event: MouseEvent): void {
    if (event.target !== event.currentTarget || !this.modal) return;
    this.close('backdrop');
  }

  template() {
    return html`
      <div class="backdrop" part="backdrop" @click=${(event: MouseEvent) => this.onBackdropClick(event)}>
        <section
          class="panel"
          part="panel"
          role="dialog"
          aria-modal=${this.modal ? 'true' : 'false'}
          aria-labelledby="title"
          aria-describedby=${this.description ? 'description' : ''}
        >
          <header part="header">
            <div class="title-row">
              <h2 id="title" part="title">${this.heading}</h2>
              <button class="close" part="close" aria-label="Close dialog" @click=${() => this.close('close')}>
                <mui-icon name="plus" size="16"></mui-icon>
              </button>
            </div>
            ${this.description ? html`<p id="description" part="description">${this.description}</p>` : ''}
          </header>
          <div class="body" part="body">
            <slot></slot>
          </div>
          <footer part="footer">
            <slot name="footer"></slot>
          </footer>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-dialog')) {
  customElements.define('mui-dialog', MuiDialog);
}
