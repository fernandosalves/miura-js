import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingTone = 'neutral' | 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'warning';

/**
 * Tokenized heading with level and tone variants.
 */
export class MuiHeading extends MuiBase {
    static tagName = 'mui-heading';

    static properties = {
        level: { type: Number, reflect: true },
        tone: { type: String, reflect: true },
    };

    level: HeadingLevel = 1;
    tone: HeadingTone = 'neutral';

    static styles = css`
        :host {
            display: block;
            font-weight: var(--mui-heading-weight, var(--mui-type-font-weight-bold));
            line-height: var(--mui-heading-line-height, 1.2);
            margin: 0 0 var(--mui-spacing-sm) 0;
            color: var(--mui-heading-color, var(--mui-color-text));
        }

        :host([level='1']) {
            --mui-heading-size: var(--mui-type-font-size-3xl);
            --mui-heading-weight: var(--mui-type-font-weight-bold);
            --mui-heading-line-height: 1.2;
        }

        :host([level='2']) {
            --mui-heading-size: var(--mui-type-font-size-2xl);
            --mui-heading-weight: var(--mui-type-font-weight-bold);
            --mui-heading-line-height: 1.25;
        }

        :host([level='3']) {
            --mui-heading-size: var(--mui-type-font-size-xl);
            --mui-heading-weight: var(--mui-type-font-weight-semibold);
            --mui-heading-line-height: 1.3;
        }

        :host([level='4']) {
            --mui-heading-size: var(--mui-type-font-size-lg);
            --mui-heading-weight: var(--mui-type-font-weight-semibold);
            --mui-heading-line-height: 1.35;
        }

        :host([level='5']) {
            --mui-heading-size: var(--mui-type-font-size-md);
            --mui-heading-weight: var(--mui-type-font-weight-medium);
            --mui-heading-line-height: 1.4;
        }

        :host([level='6']) {
            --mui-heading-size: var(--mui-type-font-size-base);
            --mui-heading-weight: var(--mui-type-font-weight-medium);
            --mui-heading-line-height: 1.4;
        }

        :host([tone='primary']) {
            --mui-heading-color: var(--mui-color-primary);
        }

        :host([tone='secondary']) {
            --mui-heading-color: var(--mui-color-text-muted);
        }

        :host([tone='accent']) {
            --mui-heading-color: var(--mui-color-accent);
        }

        :host([tone='success']) {
            --mui-heading-color: var(--mui-color-success);
        }

        :host([tone='danger']) {
            --mui-heading-color: var(--mui-color-danger);
        }

        :host([tone='warning']) {
            --mui-heading-color: var(--mui-color-warning);
        }

        .heading {
            font-size: var(--mui-heading-size, var(--mui-type-font-size-2xl));
            font-weight: var(--mui-heading-weight, var(--mui-type-font-weight-bold));
            line-height: var(--mui-heading-line-height, 1.2);
            color: var(--mui-heading-color, var(--mui-color-text));
            margin: 0;
        }
    `;

    template() {
        const tag = `h${Math.min(6, Math.max(1, this.level))}` as keyof HTMLElementTagNameMap;
        return html`<${tag} class="heading" part="heading"><slot></slot></${tag}>`;
    }
}

export function registerMuiHeading() {
    if (!customElements.get(MuiHeading.tagName)) {
        customElements.define(MuiHeading.tagName, MuiHeading);
    }
}

registerMuiHeading(); 