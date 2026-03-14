import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * Sliding overlay drawer with placement and modal options.
 */
export class MuiDrawer extends MuiBase {
    static tagName = 'mui-drawer';

    static properties = {
        open: { type: Boolean, reflect: true },
        position: { type: String, reflect: true },
        modal: { type: Boolean, reflect: true },
    };

    open = false;
    position: DrawerPosition = 'left';
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

        .drawer {
            position: absolute;
            background: var(--mui-surface);
            box-shadow: var(--mui-shadow-strong);
            padding: var(--mui-spacing-xl);
            display: flex;
            flex-direction: column;
            gap: var(--mui-spacing-md);
            transition: transform 0.3s ease;
        }

        .drawer.left {
            top: 0;
            left: 0;
            bottom: 0;
            width: min(320px, 90vw);
            transform: translateX(-100%);
        }

        .drawer.right {
            top: 0;
            right: 0;
            bottom: 0;
            width: min(320px, 90vw);
            transform: translateX(100%);
        }

        .drawer.top {
            left: 0;
            right: 0;
            top: 0;
            height: min(240px, 70vh);
            transform: translateY(-100%);
        }

        .drawer.bottom {
            left: 0;
            right: 0;
            bottom: 0;
            height: min(240px, 70vh);
            transform: translateY(100%);
        }

        :host([open]) .drawer.left,
        :host([open]) .drawer.right,
        :host([open]) .drawer.top,
        :host([open]) .drawer.bottom {
            transform: translate(0);
        }

        ::slotted([slot='header']) {
            font-size: var(--mui-type-font-size-lg);
            font-weight: var(--mui-type-font-weight-semibold);
        }

        ::slotted([slot='actions']) {
            display: flex;
            justify-content: flex-end;
            gap: var(--mui-spacing-sm);
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

    private closeDrawer = () => {
        if (!this.open) return;
        this.open = false;
        this.emit('mui-drawer-close', {});
    };

    private handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.open) {
            this.closeDrawer();
        }
    };

    private handleBackdropClick = () => {
        if (this.modal) {
            this.closeDrawer();
        }
    };

    template() {
        return html`
            <div class="backdrop" part="backdrop" @click=${this.handleBackdropClick}></div>
            <div class="drawer ${this.position}" part="drawer" role="dialog" aria-modal=${this.modal}>
                <slot name="header"></slot>
                <slot></slot>
                <slot name="actions"></slot>
            </div>
        `;
    }
}

export function registerMuiDrawer() {
    if (!customElements.get(MuiDrawer.tagName)) {
        customElements.define(MuiDrawer.tagName, MuiDrawer);
    }
}

registerMuiDrawer(); 