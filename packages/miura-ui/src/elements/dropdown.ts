import { MiuraElement, css, html } from '@miurajs/miura-element';
import './menu.js';

export class MuiDropdown extends MiuraElement {
  static properties = {
    items: { type: Array, default: () => [] },
    open: { type: Boolean, default: false, reflect: true },
    label: { type: String, default: 'Open menu' },
  };

  declare items: unknown[];
  declare open: boolean;
  declare label: string;

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
      font-family: var(--mui-font-sans);
    }

    .panel {
      position: absolute;
      z-index: 40;
      top: calc(100% + var(--mui-space-2));
      right: 0;
      display: none;
      min-width: 240px;
      padding: var(--mui-space-2);
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      box-shadow: var(--mui-shadow-lg);
    }

    :host([open]) .panel {
      display: block;
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

  private toggle(): void {
    this.open = !this.open;
    this.emit('open-change', { open: this.open }, { bubbles: true, composed: true });
  }

  private close(): void {
    if (!this.open) return;
    this.open = false;
    this.emit('open-change', { open: false }, { bubbles: true, composed: true });
  }

  private onDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open || this.contains(event.target as Node)) return;
    this.close();
  };

  private onDocumentKeydown = (event: KeyboardEvent): void => {
    if (this.open && event.key === 'Escape') this.close();
  };

  private onItemSelect(event: CustomEvent): void {
    this.close();
    this.emit('item-select', event.detail, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <mui-button variant="secondary" aria-haspopup="menu" aria-expanded=${this.open ? 'true' : 'false'} @click=${() => this.toggle()}>
        <slot name="trigger">${this.label}</slot>
      </mui-button>
      <div class="panel" part="panel">
        <mui-menu .items=${this.items} @item-select=${(event: CustomEvent) => this.onItemSelect(event)}></mui-menu>
      </div>
    `;
  }
}

if (!customElements.get('mui-dropdown')) {
  customElements.define('mui-dropdown', MuiDropdown);
}
