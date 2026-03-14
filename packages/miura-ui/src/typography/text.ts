import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type TextVariant = 'body' | 'body-lg' | 'caption' | 'overline' | 'subtitle' | 'subtitle-lg';
type TextDisplay = 'inline' | 'block';

/**
 * Tokenized text component with variants and display options.
 */
export class MuiText extends MuiBase {
    static tagName = 'mui-text';

    static properties = {
        variant: { type: String, reflect: true },
        display: { type: String, reflect: true },
        tone: { type: String, reflect: true },
    };

    variant: TextVariant = 'body';
    display: TextDisplay = 'inline';
    tone: 'neutral' | 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'warning' = 'neutral';

    static styles = css`
        :host {
            display: var(--mui-text-display, inline);
            color: var(--mui-text-color, var(--mui-color-text));
            font-size: var(--mui-text-size, var(--mui-type-font-size-md));
            font-weight: var(--mui-text-weight, var(--mui-type-font-weight-normal));
            line-height: var(--mui-text-line-height, 1.5);
            letter-spacing: var(--mui-text-letter-spacing, normal);
        }

        :host([display='block']) {
            --mui-text-display: block;
        }

        :host([variant='body']) {
            --mui-text-size: var(--mui-type-font-size-md);
            --mui-text-weight: var(--mui-type-font-weight-normal);
        }

        :host([variant='body-lg']) {
            --mui-text-size: var(--mui-type-font-size-lg);
            --mui-text-weight: var(--mui-type-font-weight-normal);
        }

        :host([variant='caption']) {
            --mui-text-size: var(--mui-type-font-size-sm);
            --mui-text-weight: var(--mui-type-font-weight-normal);
            --mui-text-line-height: 1.4;
        }

        :host([variant='overline']) {
            --mui-text-size: var(--mui-type-font-size-xs);
            --mui-text-weight: var(--mui-type-font-weight-semibold);
            --mui-text-letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        :host([variant='subtitle']) {
            --mui-text-size: var(--mui-type-font-size-base);
            --mui-text-weight: var(--mui-type-font-weight-medium);
        }

        :host([variant='subtitle-lg']) {
            --mui-text-size: var(--mui-type-font-size-lg);
            --mui-text-weight: var(--mui-type-font-weight-medium);
        }

        :host([tone='primary']) {
            --mui-text-color: var(--mui-color-primary);
        }

        :host([tone='secondary']) {
            --mui-text-color: var(--mui-color-text-muted);
        }

        :host([tone='accent']) {
            --mui-text-color: var(--mui-color-accent);
        }

        :host([tone='success']) {
            --mui-text-color: var(--mui-color-success);
        }

        :host([tone='danger']) {
            --mui-text-color: var(--mui-color-danger);
        }

        :host([tone='warning']) {
            --mui-text-color: var(--mui-color-warning);
        }
    `;

    template() {
        return html`<slot></slot>`;
    }
}

export function registerMuiText() {
    if (!customElements.get(MuiText.tagName)) {
        customElements.define(MuiText.tagName, MuiText);
    }
}

registerMuiText(); 