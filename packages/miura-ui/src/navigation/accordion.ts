import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

/**
 * Accessible accordion supporting keyboard toggle and tokens.
 */
export class MuiAccordion extends MuiBase {
    static tagName = 'mui-accordion';

    static properties = {
        open: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
    };

    open = false;
    disabled = false;

    static styles = css`
        :host {
            display: block;
            border-radius: var(--mui-radius-lg);
            box-shadow: var(--mui-shadow-soft);
            background: var(--mui-surface);
            overflow: hidden;
        }

        button {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: var(--mui-spacing-sm);
            padding: var(--mui-spacing-md) var(--mui-spacing-lg);
            background: transparent;
            border: none;
            font-weight: var(--mui-type-font-weight-semibold);
            font-size: var(--mui-type-font-size-md);
            cursor: pointer;
            color: var(--mui-color-text);
        }

        button:focus-visible {
            outline: 2px solid color-mix(in srgb, var(--mui-color-primary) 40%, transparent);
            outline-offset: 2px;
        }

        :host([disabled]) button {
            cursor: not-allowed;
            opacity: 0.6;
        }

        .content {
            padding: 0 var(--mui-spacing-lg) var(--mui-spacing-lg);
            display: var(--mui-accordion-display, none);
        }

        :host([open]) {
            --mui-accordion-display: block;
        }

        .caret {
            transition: transform 0.2s ease;
        }

        :host([open]) .caret {
            transform: rotate(180deg);
        }
    `;

    private handleToggle = () => {
        if (this.disabled) return;
        this.open = !this.open;
        this.emit('mui-accordion-toggle', { open: this.open });
    };

    private handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleToggle();
        }
    };

    template() {
        return html`
            <button
                type="button"
                part="header"
                aria-expanded=${this.open}
                aria-disabled=${this.disabled}
                @click=${this.handleToggle}
                @keydown=${this.handleKeydown}
            >
                <slot name="header"></slot>
                <span class="caret" aria-hidden="true">⌄</span>
            </button>
            <div class="content" part="content" role="region" ?hidden=${!this.open}>
                <slot name="content"></slot>
            </div>
        `;
    }
}

export function registerMuiAccordion() {
    if (!customElements.get(MuiAccordion.tagName)) {
        customElements.define(MuiAccordion.tagName, MuiAccordion);
    }
}

registerMuiAccordion();