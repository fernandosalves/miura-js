import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type OverlayTone = 'dark' | 'light' | 'blur';

export class MuiOverlay extends MuiBase {
    static tagName = 'mui-overlay';

    static properties = {
        open: { type: Boolean, reflect: true },
        tone: { type: String, reflect: true },
        dismissible: { type: Boolean, reflect: true },
    };

    open = true;
    tone: OverlayTone = 'dark';
    dismissible = false;

    static styles = css`
        :host {
            position: fixed;
            inset: 0;
            display: none;
            z-index: 1000;
        }

        :host([open]) {
            display: block;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: color-mix(in srgb, #000 48%, transparent);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--mui-spacing-lg);
        }

        :host([tone='light']) .overlay {
            background: color-mix(in srgb, #fff 70%, transparent);
        }

        :host([tone='blur']) .overlay {
            backdrop-filter: blur(16px);
            background: color-mix(in srgb, rgba(15, 23, 42, 0.55) 60%, transparent);
        }
    `;

    firstUpdated(): void {
        this.addEventListener('click', this.handleBackdropClick);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback?.();
        this.removeEventListener('click', this.handleBackdropClick);
    }

    private handleBackdropClick = (event: MouseEvent) => {
        if (!this.dismissible || event.target !== this) return;
        this.open = false;
        this.emit('mui-overlay-close', {});
    };

    template() {
        return html`<div class="overlay" part="overlay"><slot></slot></div>`;
    }
}

export function registerMuiOverlay() {
    if (!customElements.get(MuiOverlay.tagName)) {
        customElements.define(MuiOverlay.tagName, MuiOverlay);
    }
}

registerMuiOverlay();