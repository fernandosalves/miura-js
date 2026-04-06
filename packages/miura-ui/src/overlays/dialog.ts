import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Dialog — modal dialog with backdrop, title, content, actions.
 *
 * <mui-dialog ?open=${this.open} @close=${() => this.open = false}>
 *   <span slot="title">Confirm Delete</span>
 *   <p>Are you sure?</p>
 *   <div slot="actions">
 *     <mui-button variant="ghost" @click=${() => this.open = false}>Cancel</mui-button>
 *     <mui-button variant="destructive">Delete</mui-button>
 *   </div>
 * </mui-dialog>
 */
@component({ tag: 'mui-dialog' })
export class MuiDialog extends MiuraElement {
    @property({ type: Boolean, default: false, reflect: true })
    open!: boolean;

    @property({ type: String, default: 'md' })
    size!: 'sm' | 'md' | 'lg' | 'xl' | 'full';

    @property({ type: Boolean, default: true })
    closeable!: boolean;

    @property({ type: Boolean, default: true })
    closeOnBackdrop!: boolean;

    @property({ type: Boolean, default: true })
    closeOnEscape!: boolean;

    private _handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.closeOnEscape) this._close();
    };

    updated() {
        if (this.open) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', this._handleKeyDown);
        } else {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', this._handleKeyDown);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this._handleKeyDown);
    }

    private _close() {
        this.emit('close');
    }

    static styles: any = css`
    :host { display: contents; }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
      z-index: var(--mui-z-modal, 1200);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--mui-space-4, 16px);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity var(--mui-duration-normal, 200ms) ease,
                  visibility var(--mui-duration-normal, 200ms) ease;
    }

    :host([open]) .backdrop {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .dialog {
      position: relative;
      background: var(--mui-surface, #fff);
      border-radius: var(--mui-radius-xl, 12px);
      box-shadow: var(--mui-shadow-2xl, 0 24px 64px rgba(0,0,0,0.2));
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 64px);
      width: var(--_dialog-width, 480px);
      transform: translateY(8px) scale(0.97);
      transition: transform var(--mui-duration-normal, 200ms) var(--mui-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
    }

    :host([open]) .dialog {
      transform: translateY(0) scale(1);
    }

    /* Sizes */
    :host([size="sm"]) .dialog { --_dialog-width: 360px; }
    :host([size="md"]) .dialog { --_dialog-width: 480px; }
    :host([size="lg"]) .dialog { --_dialog-width: 640px; }
    :host([size="xl"]) .dialog { --_dialog-width: 800px; }
    :host([size="full"]) .dialog { --_dialog-width: calc(100vw - 64px); max-height: calc(100vh - 64px); }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-3, 12px);
      padding: var(--mui-space-5, 20px) var(--mui-space-5, 20px) var(--mui-space-4, 16px);
      flex-shrink: 0;
    }

    .dialog-title {
      font-size: var(--mui-text-lg, 1.125rem);
      font-weight: var(--mui-weight-semibold, 600);
      color: var(--mui-text, #1f2937);
      margin: 0;
      flex: 1;
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: var(--mui-radius-md, 6px);
      color: var(--mui-text-secondary, #6b7280);
      cursor: pointer;
      flex-shrink: 0;
      transition: background var(--mui-duration-fast, 100ms) ease;
    }

    .close-btn:hover { background: var(--mui-surface-hover, rgba(0,0,0,0.04)); color: var(--mui-text, #1f2937); }
    .close-btn svg { width: 18px; height: 18px; }

    .dialog-body {
      padding: 0 var(--mui-space-5, 20px) var(--mui-space-5, 20px);
      overflow-y: auto;
      flex: 1;
      color: var(--mui-text-secondary, #6b7280);
      font-size: var(--mui-text-sm, 0.875rem);
      line-height: 1.6;
    }

    .dialog-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--mui-space-2, 8px);
      padding: var(--mui-space-4, 16px) var(--mui-space-5, 20px);
      border-top: 1px solid var(--mui-border, #e5e7eb);
      flex-shrink: 0;
    }

    .dialog-footer:not(:has(::slotted(*))) {
      display: none;
    }
  `;

    template() {
        return html`
      <div class="backdrop" @click=${(e: MouseEvent) => { if (e.target === e.currentTarget && this.closeOnBackdrop) this._close(); }}>
        <div class="dialog" role="dialog" aria-modal="true">
          <header class="dialog-header">
            <h2 class="dialog-title"><slot name="title">Dialog</slot></h2>
            ${this.closeable ? html`
              <button class="close-btn" aria-label="Close" @click=${() => this._close()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            ` : ''}
          </header>
          <div class="dialog-body">
            <slot></slot>
          </div>
          <footer class="dialog-footer">
            <slot name="actions"></slot>
          </footer>
        </div>
      </div>
    `;
    }
}
