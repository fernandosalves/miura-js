import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type SnackbarPlacement = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';

/**
 * Tokenized snackbar with placement, auto-dismiss, and action slot.
 */
export class MuiSnackbar extends MuiBase {
    static tagName = 'mui-snackbar';

    static properties = {
        open: { type: Boolean, reflect: true },
        duration: { type: Number },
        placement: { type: String, reflect: true },
    };

    open = false;
    duration = 4000;
    placement: SnackbarPlacement = 'bottom-center';

    private timeoutId: number | null = null;

    static styles = css`
        :host {
            position: fixed;
            pointer-events: none;
            z-index: 1200;
        }

        .snackbar {
            background: var(--mui-color-neutral-900, #1e293b);
            color: var(--mui-color-neutral-100, #f1f5f9);
            border-radius: var(--mui-radius-md);
            padding: var(--mui-spacing-md) var(--mui-spacing-lg);
            font-size: var(--mui-type-font-size-md);
            box-shadow: var(--mui-shadow-strong);
            display: flex;
            align-items: center;
            gap: var(--mui-spacing-md);
            min-height: 48px;
            max-width: min(400px, 90vw);
            pointer-events: auto;
            opacity: 0;
            transform: translateY(100%) scale(0.95);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }

        :host([open]) .snackbar {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        .content {
            flex: 1;
            min-width: 0;
        }

        .action {
            flex-shrink: 0;
            background: none;
            border: none;
            color: var(--mui-color-primary, #3b82f6);
            cursor: pointer;
            font-weight: var(--mui-type-font-weight-medium);
            padding: 0;
            margin-left: var(--mui-spacing-sm);
        }

        .action:hover {
            text-decoration: underline;
        }

        /* Placement styles */
        :host([placement='bottom-center']) {
            bottom: var(--mui-spacing-xl);
            left: 50%;
            transform: translateX(-50%);
        }

        :host([placement='bottom-left']) {
            bottom: var(--mui-spacing-xl);
            left: var(--mui-spacing-xl);
        }

        :host([placement='bottom-right']) {
            bottom: var(--mui-spacing-xl);
            right: var(--mui-spacing-xl);
        }

        :host([placement='top-center']) {
            top: var(--mui-spacing-xl);
            left: 50%;
            transform: translateX(-50%);
        }

        :host([placement='top-left']) {
            top: var(--mui-spacing-xl);
            left: var(--mui-spacing-xl);
        }

        :host([placement='top-right']) {
            top: var(--mui-spacing-xl);
            right: var(--mui-spacing-xl);
        }
    `;

    updated(changedProperties: Map<string, any>): void {
        super.updated(changedProperties);

        if (changedProperties.has('open')) {
            if (this.open) {
                this.startAutoDismiss();
            } else {
                this.clearAutoDismiss();
            }
        }

        if (changedProperties.has('duration')) {
            if (this.open) {
                this.startAutoDismiss();
            }
        }
    }

    private startAutoDismiss(): void {
        this.clearAutoDismiss();
        if (this.duration > 0) {
            this.timeoutId = window.setTimeout(() => {
                this.open = false;
                this.emit('mui-snackbar-timeout', {});
            }, this.duration);
        }
    }

    private clearAutoDismiss(): void {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    private handleAction = (event: Event) => {
        this.emit('mui-snackbar-action', { event });
    };

    template() {
        return html`
            <div class="snackbar" part="snackbar">
                <div class="content" part="content">
                    <slot></slot>
                </div>
                <button class="action" part="action" @click=${this.handleAction}>
                    <slot name="action">Dismiss</slot>
                </button>
            </div>
        `;
    }
}

export function registerMuiSnackbar() {
    if (!customElements.get(MuiSnackbar.tagName)) {
        customElements.define(MuiSnackbar.tagName, MuiSnackbar);
    }
}

registerMuiSnackbar(); 