import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type CardVariant = 'elevated' | 'outlined' | 'subtle';

/**
 * Tokenized card component with header/body/footer slots.
 */
export class MuiCard extends MuiBase {
    static tagName = 'mui-card';

    static properties = {
        variant: { type: String, reflect: true },
        padding: { type: String, reflect: true },
    };

    variant: CardVariant = 'elevated';
    padding: 'none' | 'sm' | 'md' | 'lg' = 'md';

    static styles = css`
        :host {
            display: block;
        }

        .card {
            background: var(--mui-card-background, var(--mui-surface));
            border-radius: var(--mui-radius-lg);
            padding: var(--mui-card-padding, var(--mui-spacing-lg));
            box-shadow: var(--mui-card-shadow, var(--mui-shadow-soft));
            border: var(--mui-card-border, none);
            color: var(--mui-color-text);
            display: flex;
            flex-direction: column;
        }

        :host([variant='outlined']) {
            --mui-card-shadow: none;
            --mui-card-border: 1px solid color-mix(in srgb, var(--mui-color-border) 65%, transparent);
        }

        :host([variant='subtle']) {
            --mui-card-background: color-mix(in srgb, var(--mui-surface) 98%, transparent);
            --mui-card-shadow: none;
        }

        :host([padding='none']) {
            --mui-card-padding: 0;
        }

        :host([padding='sm']) {
            --mui-card-padding: var(--mui-spacing-sm);
        }

        :host([padding='md']) {
            --mui-card-padding: var(--mui-spacing-md);
        }

        :host([padding='lg']) {
            --mui-card-padding: var(--mui-spacing-lg);
        }

        [part='header'] {
            font-weight: var(--mui-type-font-weight-semibold);
            font-size: var(--mui-type-font-size-lg);
            color: var(--mui-color-text);
        }

        [part='footer'] {
            display: flex;
            justify-content: flex-end;
            gap: var(--mui-spacing-sm);
            color: var(--mui-color-text-muted, #475569);
        }
    `;

    template() {
        return html`
            <article class="card" part="card">
                <slot name="header" part="header"></slot>
                <slot></slot>
                <slot name="footer" part="footer"></slot>
            </article>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
    }
}

export function registerMuiCard() {
    if (!customElements.get(MuiCard.tagName)) {
        customElements.define(MuiCard.tagName, MuiCard);
    }
}

registerMuiCard();