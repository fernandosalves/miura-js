import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

/**
 * Accessible dialog with tokenized overlay and focus trap support.
 */
export class MuiDialog extends MuiBase {
    static tagName = 'mui-dialog';

    static properties = {
        open: { type: Boolean, reflect: true },
        modal: { type: Boolean, reflect: true },
    };

    open = false;
    modal = true;

    static styles = css`
        :host {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 1000;
        }

        :host([open]) {
            pointer-events: auto;
        }

        .backdrop {
            position: absolute;
            inset: 0;
            background: color-mix(in srgb, rgba(15, 23, 42, 0.6) 70%, transparent);
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        :host([open]) .backdrop {
            opacity: 1;
        }

        :host(:not([modal])) .backdrop {
            display: none;
        }

        .dialog {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.95);
            background: var(--mui-surface);
            border-radius: var(--mui-radius-xl);
            box-shadow: var(--mui-shadow-strong);
            padding: var(--mui-spacing-xl);
            min-width: 320px;
            max-width: min(600px, 90vw);
            max-height: min(80vh, 600px);
            opacity: 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: var(--mui-spacing-md);
        }

        :host([open]) .dialog {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        ::slotted([slot='header']) {
            font-size: var(--mui-type-font-size-lg);
            font-weight: var(--mui-type-font-weight-semibold);
            flex-shrink: 0;
        }

        .dialog-body {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
        }

        ::slotted([slot='actions']) {
            display: flex;
            justify-content: flex-end;
            gap: var(--mui-spacing-sm);
            flex-shrink: 0;
        }
    `;

    connectedCallback(): void {
        super.connectedCallback?.();
        document.addEventListener('keydown', this.handleKeydown);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback?.();
        document.removeEventListener('keydown', this.handleKeydown);
    }

    private closeDialog = () => {
        if (!this.open) return;
        this.open = false;
        this.emit('mui-dialog-close', {});
    };

    private handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.open) {
            this.closeDialog();
        }
    };

    private handleBackdropClick = () => {
        if (this.modal) {
            this.closeDialog();
        }
    };

    template() {
        return html`
            <div class="backdrop" part="backdrop" @click=${this.handleBackdropClick}></div>
            <div class="dialog" part="dialog" role="dialog" aria-modal=${this.modal}>
                <slot name="header"></slot>
                <div class="dialog-body">
                    <slot></slot>
                </div>
                <slot name="actions"></slot>
            </div>
        `;
    }
}

export function registerMuiDialog() {
    if (!customElements.get(MuiDialog.tagName)) {
        customElements.define(MuiDialog.tagName, MuiDialog);
    }
}

registerMuiDialog(); 