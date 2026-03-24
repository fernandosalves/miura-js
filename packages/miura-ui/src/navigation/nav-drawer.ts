import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type DrawerSide = 'start' | 'end';

/**
 * Sliding navigation drawer with overlay support.
 */
export class MuiNavDrawer extends MuiBase {
    static tagName = 'mui-nav-drawer';

    static properties = {
        open: { type: Boolean, reflect: true },
        side: { type: String, reflect: true },
        modal: { type: Boolean, reflect: true },
    };

    open = false;
    side: DrawerSide = 'start';
    modal = true;

    static styles = css`
        :host {
            position: fixed;
            inset: 0;
            pointer-events: none;
        }

        :host([open]) {
            pointer-events: auto;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: color-mix(in srgb, rgba(15, 23, 42, 0.65) 70%, transparent);
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        :host([open]) .overlay {
            opacity: 1;
        }

        :host(:not([modal])) .overlay {
            display: none;
        }

        .drawer {
            position: absolute;
            top: 0;
            bottom: 0;
            width: min(320px, 90vw);
            background: var(--mui-surface);
            box-shadow: var(--mui-shadow-strong);
            padding: var(--mui-spacing-xl) var(--mui-spacing-lg);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
            gap: var(--mui-spacing-md);
        }

        :host([side='end']) .drawer {
            right: 0;
            left: auto;
            transform: translateX(100%);
        }

        :host([open][side='start']) .drawer {
            transform: translateX(0);
            left: 0;
        }

        :host([open][side='end']) .drawer {
            transform: translateX(0);
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
        this.emit('mui-nav-drawer-close', {});
    };

    private handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.open) {
            this.closeDrawer();
        }
    };

    private handleOverlayClick = () => {
        if (this.modal) {
            this.closeDrawer();
        }
    };

    template() {
        return html`
            <div class="overlay" part="overlay" @click=${this.handleOverlayClick}></div>
            <aside class="drawer" part="drawer" role="dialog" aria-modal=${this.modal}>
                <slot></slot>
            </aside>
        `;
    }
}

export function registerMuiNavDrawer() {
    if (!customElements.get(MuiNavDrawer.tagName)) {
        customElements.define(MuiNavDrawer.tagName, MuiNavDrawer);
    }
}

registerMuiNavDrawer();