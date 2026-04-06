import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Drawer/Slide-in panel component
 * Usage:
 * <mui-drawer open placement="right">
 *   <span slot="title">Drawer Title</span>
 *   <p>Drawer content</p>
 * </mui-drawer>
 */
@component({ tag: 'mui-drawer' })
export class MuiDrawer extends MiuraElement {
  @property({ type: Boolean, default: false })
  open!: boolean;

  @property({ type: String, default: 'right' })
  placement!: 'left' | 'right' | 'top' | 'bottom';

  @property({ type: String, default: 'md' })
  size!: 'sm' | 'md' | 'lg' | 'full';

  @property({ type: Boolean, default: true })
  closeable!: boolean;

  @property({ type: Boolean, default: true })
  closeOnBackdrop!: boolean;

  @property({ type: Boolean, default: true })
  closeOnEscape!: boolean;

  @property({ type: Boolean, default: true })
  preventScroll!: boolean;

  static get styles() {
    return css`
      :host {
        display: contents;
      }

      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: var(--mui-z-modal, 1200);
        opacity: 0;
        visibility: hidden;
        transition: opacity var(--mui-duration-normal) var(--mui-easing-standard),
                    visibility var(--mui-duration-normal) var(--mui-easing-standard);
      }

      :host([open]) .backdrop {
        opacity: 1;
        visibility: visible;
      }

      .drawer {
        position: fixed;
        z-index: var(--mui-z-modal, 1200);
        background: var(--mui-surface);
        box-shadow: var(--mui-shadow-xl);
        display: flex;
        flex-direction: column;
        transform: var(--_drawer-transform-closed);
        transition: transform var(--mui-duration-normal) var(--mui-easing-emphasized);
      }

      :host([open]) .drawer {
        transform: var(--_drawer-transform-open);
      }

      /* Placement: Right (default) */
      :host([placement="right"]) .drawer {
        top: 0;
        right: 0;
        bottom: 0;
        width: var(--_drawer-size, 400px);
        --_drawer-transform-closed: translateX(100%);
        --_drawer-transform-open: translateX(0);
      }

      /* Placement: Left */
      :host([placement="left"]) .drawer {
        top: 0;
        left: 0;
        bottom: 0;
        width: var(--_drawer-size, 400px);
        --_drawer-transform-closed: translateX(-100%);
        --_drawer-transform-open: translateX(0);
      }

      /* Placement: Top */
      :host([placement="top"]) .drawer {
        top: 0;
        left: 0;
        right: 0;
        height: var(--_drawer-size, 50vh);
        --_drawer-transform-closed: translateY(-100%);
        --_drawer-transform-open: translateY(0);
      }

      /* Placement: Bottom */
      :host([placement="bottom"]) .drawer {
        bottom: 0;
        left: 0;
        right: 0;
        height: var(--_drawer-size, 50vh);
        --_drawer-transform-closed: translateY(100%);
        --_drawer-transform-open: translateY(0);
      }

      /* Size variants (horizontal) */
      :host([placement="left"][size="sm"]) .drawer,
      :host([placement="right"][size="sm"]) .drawer { --_drawer-size: 300px; }
      
      :host([placement="left"][size="md"]) .drawer,
      :host([placement="right"][size="md"]) .drawer { --_drawer-size: 400px; }
      
      :host([placement="left"][size="lg"]) .drawer,
      :host([placement="right"][size="lg"]) .drawer { --_drawer-size: 600px; }
      
      :host([placement="left"][size="full"]) .drawer,
      :host([placement="right"][size="full"]) .drawer { --_drawer-size: 100vw; }

      /* Size variants (vertical) */
      :host([placement="top"][size="sm"]) .drawer,
      :host([placement="bottom"][size="sm"]) .drawer { --_drawer-size: 30vh; }
      
      :host([placement="top"][size="md"]) .drawer,
      :host([placement="bottom"][size="md"]) .drawer { --_drawer-size: 50vh; }
      
      :host([placement="top"][size="lg"]) .drawer,
      :host([placement="bottom"][size="lg"]) .drawer { --_drawer-size: 70vh; }
      
      :host([placement="top"][size="full"]) .drawer,
      :host([placement="bottom"][size="full"]) .drawer { --_drawer-size: 100vh; }

      /* Header */
      .drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--mui-space-3);
        padding: var(--mui-space-4) var(--mui-space-5);
        border-bottom: 1px solid var(--mui-border);
        flex-shrink: 0;
      }

      .drawer-title {
        flex: 1;
        font-size: var(--mui-text-lg);
        font-weight: var(--mui-weight-semibold);
        color: var(--mui-text);
        margin: 0;
      }

      .close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: var(--mui-radius-md);
        color: var(--mui-text-secondary);
        cursor: pointer;
        flex-shrink: 0;
        transition: background var(--mui-duration-fast) var(--mui-easing-standard),
                    color var(--mui-duration-fast) var(--mui-easing-standard);
      }

      .close-button:hover {
        background: var(--mui-surface-subtle);
        color: var(--mui-text);
      }

      .close-button:focus-visible {
        outline: 2px solid var(--mui-primary);
        outline-offset: 2px;
      }

      .close-icon {
        width: 18px;
        height: 18px;
      }

      /* Body */
      .drawer-body {
        padding: var(--mui-space-5);
        overflow-y: auto;
        flex: 1;
      }

      /* Footer */
      .drawer-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--mui-space-2);
        padding: var(--mui-space-4) var(--mui-space-5);
        border-top: 1px solid var(--mui-border);
        background: var(--mui-surface-subtle);
        flex-shrink: 0;
      }

      .drawer-footer:not(:has(::slotted(*))) {
        display: none;
      }
    `;
  }

  private _previouslyFocused: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  updated() {
    if (this.open) {
      this._onOpen();
    } else {
      this._onClose();
    }
  }

  private _onOpen() {
    this._previouslyFocused = document.activeElement as HTMLElement;

    if (this.preventScroll) {
      document.body.style.overflow = 'hidden';
    }

    document.addEventListener('keydown', this._handleKeyDown);

    requestAnimationFrame(() => {
      const drawer = this.shadowRoot?.querySelector('.drawer') as HTMLElement;
      drawer?.focus();
    });
  }

  private _onClose() {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._handleKeyDown);
    this._previouslyFocused?.focus();
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.closeOnEscape) {
      this._close();
    }
  }

  private _handleBackdropClick() {
    if (this.closeOnBackdrop) {
      this._close();
    }
  }

  private _close() {
    this.emit('close');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleKeyDown);
    document.body.style.overflow = '';
  }

  template() {
    const closeIcon = html`
      <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    `;

    return html`
      <div class="backdrop" @click=${this._handleBackdropClick.bind(this)}></div>
      <aside 
        class="drawer" 
        role="dialog" 
        aria-modal="true"
        tabindex="-1"
        @click=${(e: Event) => e.stopPropagation()}
      >
        <header class="drawer-header">
          <h2 class="drawer-title">
            <slot name="title"></slot>
          </h2>
          <button 
            class="close-button" 
            aria-label="Close drawer"
            @click=${this._close.bind(this)}
            #if=${this.closeable}
          >
            ${closeIcon}
          </button>
        </header>
        <div class="drawer-body">
          <slot></slot>
        </div>
        <footer class="drawer-footer">
          <slot name="actions"></slot>
        </footer>
      </aside>
    `;
  }
}
