import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiPopover extends MiuraElement {
  static properties = {
    open: { type: Boolean, default: false, reflect: true },
    placement: { type: String, default: 'bottom-start', reflect: true },
  };

  declare open: boolean;
  declare placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
      font-family: var(--mui-font-sans);
    }

    .panel {
      position: absolute;
      z-index: 40;
      min-width: 220px;
      display: none;
      padding: var(--mui-space-4);
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      box-shadow: var(--mui-shadow-lg);
    }

    :host([open]) .panel {
      display: block;
    }

    :host([placement="bottom-start"]) .panel {
      top: calc(100% + var(--mui-space-2));
      left: 0;
    }

    :host([placement="bottom-end"]) .panel {
      top: calc(100% + var(--mui-space-2));
      right: 0;
    }

    :host([placement="top-start"]) .panel {
      bottom: calc(100% + var(--mui-space-2));
      left: 0;
    }

    :host([placement="top-end"]) .panel {
      bottom: calc(100% + var(--mui-space-2));
      right: 0;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('pointerdown', this.onDocumentPointerDown);
    document.addEventListener('keydown', this.onDocumentKeydown);
  }

  disconnectedCallback(): void {
    document.removeEventListener('pointerdown', this.onDocumentPointerDown);
    document.removeEventListener('keydown', this.onDocumentKeydown);
    super.disconnectedCallback();
  }

  show(): void {
    if (this.open) return;
    this.open = true;
    this.emit('open-change', { open: true }, { bubbles: true, composed: true });
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.emit('open-change', { open: false }, { bubbles: true, composed: true });
  }

  toggle(): void {
    this.open ? this.close() : this.show();
  }

  private onDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open || this.contains(event.target as Node)) return;
    this.close();
  };

  private onDocumentKeydown = (event: KeyboardEvent): void => {
    if (this.open && event.key === 'Escape') this.close();
  };

  template() {
    return html`
      <span part="anchor" @click=${() => this.toggle()}><slot name="anchor"></slot></span>
      <div class="panel" part="panel"><slot></slot></div>
    `;
  }
}

if (!customElements.get('mui-popover')) {
  customElements.define('mui-popover', MuiPopover);
}
